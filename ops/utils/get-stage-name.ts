import * as cdk from 'aws-cdk-lib';

const ALLOWED_STAGES = ['prod', 'staging'];

export const getStageName = (app: cdk.App) => {
  const stageName = app.node.tryGetContext('stage') as string;

  if (stageName === undefined) {
    throw new Error(
      'Deployment stage cannot be empty! Specify the stage with --context stage=<name>',
    );
  }

  if (!ALLOWED_STAGES.includes(stageName)) {
    throw new Error(`Deployment stage must be ${ALLOWED_STAGES.join(' or ')}`);
  }

  return stageName;
};
