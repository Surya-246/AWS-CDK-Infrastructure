import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
      natGateways: 0,

      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for my EC2 instance',
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access  ');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP access ');
    const bucket = new s3.Bucket(this, 'StudentDocumnetsBucket',{
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
   });
   const ec2Role = new iam.Role(this, 'StudentManagementRole',{
    assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    description: 'IAM Role for Student Management EC2',
    
   });
   bucket.grantReadWrite(ec2Role);

    const instance = new ec2.Instance(this, 'StudentManagementServer', {
      vpc,
      role: ec2Role,
      instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.MICRO,
    ),
    machineImage: ec2.MachineImage.latestAmazonLinux2(),
    securityGroup,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PUBLIC,
  },
});
   
  }
}