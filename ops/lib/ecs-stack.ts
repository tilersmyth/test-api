import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
  CodeBuildAction,
  EcrSourceAction,
  EcsDeployAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecspatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { StageContext } from '../types/stage-context';

interface Props extends cdk.StackProps {
  stageName: string;
  config: StageContext;
  env: {
    account: string;
    region: string;
  };
}

export class Ecstack extends cdk.Stack {
  private repoName: string;
  private hostedZone: cdk.aws_route53.IHostedZone;
  private certificate: cdk.aws_certificatemanager.Certificate;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.repoName = props.stageName;

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'VpsHostedZone',
      {
        hostedZoneId: props.config.hostedZoneId,
        zoneName: props.config.zoneName,
      },
    );

    this.certificate = new acm.Certificate(this, 'AcmHostedCertificate', {
      domainName: `vps.${this.hostedZone.zoneName}`,
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    const ecrRepository = new ecr.Repository(this, 'VpsEcrRepository', {
      repositoryName: `${this.repoName}-vps-ecr-repo`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const pipelineProject = this.createPipelineProject(ecrRepository);
    pipelineProject.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonEC2ContainerRegistryPowerUser',
      ),
    );

    const sourceOutput = new Artifact();
    const buildOutput = new Artifact();

    const ecrSourceAction = this.createSourceAction(
      ecrRepository,
      sourceOutput,
    );

    const buildAction = this.buildImageDefinition(
      pipelineProject,
      sourceOutput,
      buildOutput,
    );

    const vpc = ec2.Vpc.fromLookup(this, 'VpsVpc', {
      vpcId: props.config.vpcId,
    });

    const ecsDeployAction = this.createEcsDeployAction(
      vpc,
      ecrRepository,
      buildOutput,
      pipelineProject,
    );

    const pipeline = new Pipeline(this, 'VpsPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [ecrSourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Deploy',
          actions: [ecsDeployAction],
        },
      ],
      pipelineName: 'vps_pipeline',
    });
  }

  private createPipelineProject(
    ecrRepo: ecr.Repository,
  ): codebuild.PipelineProject {
    const pipelineProject = new codebuild.PipelineProject(
      this,
      'vps-codepipeline',
      {
        projectName: 'vps-codepipeline',
        cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
          privileged: true,
        },
        environmentVariables: {
          ECR_REPO: {
            value: ecrRepo.repositoryUriForTag(),
          },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: {
              commands: [
                'echo creating imagedefinitions.json dynamically',
                'printf \'[{"name":"' +
                  this.repoName +
                  '","imageUri": "' +
                  ecrRepo.repositoryUriForTag() +
                  ':latest"}]\' > imagedefinitions.json',
                'echo Build completed on `date`',
              ],
            },
          },
          artifacts: {
            files: ['imagedefinitions.json'],
          },
        }),
      },
    );
    return pipelineProject;
  }

  private createSourceAction(ecrRepo: ecr.Repository, sourceOutput: Artifact) {
    return new EcrSourceAction({
      actionName: 'ListenVpsEcrPush',
      repository: ecrRepo,
      imageTag: 'latest',
      output: sourceOutput,
    });
  }

  private buildImageDefinition(
    pipelineProject: PipelineProject,
    sourceOutput: Artifact,
    buildOutput: Artifact,
  ) {
    return new CodeBuildAction({
      actionName: 'ConvertVpsEcrOutputToImageDefinitions',
      project: pipelineProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });
  }

  public createEcsDeployAction(
    vpc: cdk.aws_ec2.IVpc,
    ecrRepo: ecr.Repository,
    buildOutput: Artifact,
    pipelineProject: PipelineProject,
  ): EcsDeployAction {
    return new EcsDeployAction({
      actionName: 'VpsEcsDeployAction',
      service: this.createLoadBalancedFargateService(
        this,
        vpc,
        ecrRepo,
        pipelineProject,
      ).service,
      input: buildOutput,
    });
  }

  public createLoadBalancedFargateService(
    scope: Construct,
    vpc: cdk.aws_ec2.IVpc,
    ecrRepository: ecr.Repository,
    pipelineProject: PipelineProject,
  ) {
    const fargateService =
      new ecspatterns.ApplicationLoadBalancedFargateService(
        scope,
        'VpsFargateService',
        {
          vpc,
          memoryLimitMiB: 512,
          cpu: 256,
          assignPublicIp: true,
          certificate: this.certificate,
          redirectHTTP: true,
          listenerPort: 443,
          protocol: elbv2.ApplicationProtocol.HTTPS,
          publicLoadBalancer: true,
          taskImageOptions: {
            containerName: this.repoName,
            image: ecs.ContainerImage.fromRegistry(
              'tilersmyth/ecs-placeholder:latest',
            ),
            containerPort: 3000,
          },
        },
      );

    fargateService.taskDefinition.executionRole?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonEC2ContainerRegistryPowerUser',
      ),
    );

    fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyHttpCodes: '200-299',
      interval: cdk.Duration.seconds(45),
      timeout: cdk.Duration.seconds(30),
      unhealthyThresholdCount: 5,
      healthyThresholdCount: 2,
    });

    fargateService.targetGroup.setAttribute(
      'deregistration_delay.timeout_seconds',
      '60',
    );

    fargateService.targetGroup.setAttribute(
      'slow_start.duration_seconds',
      '30',
    );

    new route53.CnameRecord(this, 'VpsApi', {
      zone: this.hostedZone,
      recordName: 'vps',
      domainName: fargateService.loadBalancer.loadBalancerDnsName,
    });

    return fargateService;
  }
}
