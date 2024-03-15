import * as cdk from 'aws-cdk-lib';

import { Ecstack } from '../lib/ecs-stack';
import { StageContext } from '../types/stage-context';
import { capitalize } from '../utils/capitalize';
import { getStageName } from '../utils/get-stage-name';

const app = new cdk.App();

const stageName = getStageName(app);

const config = app.node.tryGetContext(stageName) as StageContext;

const formattedStageName = capitalize(stageName);

new Ecstack(app, `VpsEcsStack${formattedStageName}`, {
  stageName,
  config,
  env: { account: config.awsAccountId, region: 'us-east-1' },
});
