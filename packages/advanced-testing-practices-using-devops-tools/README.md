# advanced-testing-practices-using-devops-tools

This package provides the challenges from [Advanced Testing Practices Using AWS DevOps Tools](https://www.aws.training/learningobject/wbc?id=59874) as updated to function properly within the most recent implementations of the relevant AWS services.  Note that the project can be deployed via the included CloudFormation template and related zip files found in the [dist](./dist) folder.

## Optional Course Exercise Content

If you'd like to experiment with some of the concepts you learned in this course, complete the following steps to create a sandbox environment with your own AWS account. Then, complete a series of optional challenges.

You will incur charges for the AWS resources used to create this sandbox environment. The charges for some of the resources may be covered through the AWS Free Tier. The exercise uses free tier choices wherever possible.

### Prerequisites

- You will need an AWS account and administrative credentials to complete this exercise.
- You should be familiar with AWS core services such as Amazon EC2, Amazon Virtual Private Cloud (Amazon VPC), and AWS CloudFormation. You should also be comfortable using the AWS console. The instructions are written with the understanding that the account is new or clean. We strongly recommend you do not do this exercise in "work" or "production" accounts.
- If you are using an existing account with resources already deployed in a region, be aware of the soft limit of five VPCs per region.

### Required Resources

Download the [demoEnv.zip](./dist/demoEnv.zip) file from this repository.

### Outputs from the CloudFormation template

The CloudFormation template deploys the following resources to create the sandbox environment. 

- AWS CodePipeline with CI/CD capabilities with multiple stages (source, build, test, approve, and deploy) to deploy a sample web application
- AWS CodeCommit repository to host the sample application code
- AWS CodeBuild project to build the artifact and unit test the sample web application
- AWS CodeDeploy application to deploy the sample web application
- AWS Cloud9 Integrated Development Environment (IDE) that can be used to make changes to the code and then update the repository 
- A sample web application for testing purposes hosted on Amazon EC2 instances using an Application Load Balancer
- AWS Lambda function to perform the static code testing
- Supporting infrastructure needed to host the sample web application

### Instructions to create sandbox environment

The CloudFormation template can be deployed in your account to build the CI-CD project that was used in many of the demonstrations in this course. 

> Note: You will incur charges for the AWS resources used to create this sandbox environment. 

1. At this point, you should have already downloaded the zip file that was provided. If not, please do so before proceeding.
2. Unzip the demoEnv.zip file to your local machine.
3. Log in to the AWS console for your account and navigate to Amazon S3.
4. Create a new S3 bucket in the Region you wish to deploy the template.
5. Copy the contents of the zip file to the S3 bucket. There should be three files:
    - functions.zip
    - cicd.template
    - calculator.zip
6. Navigate to AWS CloudFormation and choose Create Stack (with new resources Standard).
7. In the Template is Ready section, provide the link to the cicd.template from your S3 bucket.
8. Choose Next. Enter the stack name and provide the bucket name for where the functions.zip and calculator.zip files are stored.
9. Choose Next twice. Then select that you acknowledge the template will create resources.
10. Choose Create Stack.

### Challenge 1

View the release pipeline’s progress and note the completed and pending stages. Then, review the resolved configuration settings of the Service_Status stage. Access the deployed sample application using the URL.

#### Clues

- In AWS CodePipeline console, select the releasePipeline pipeline.
- Find the stage Service_Status.
- In the Test_Status action, click on `View details`.
- Select the Configuration tab, and review the resolved configuration parameters.
- Access the deploye sample application by navigating to the URL shown in the UserParameters field

### Challenge 2

The release pipeline is currently pending for approval. Approve or reject the stage action Purge_Test and notice how your pipeline reacts. For clues to complete the challenge, select the + symbol.

#### Clues

- In AWS CodePipeline console, select the releasePipeline pipeline.
- Find the stage Approval.
- In the stage action Purge_Test, choose Review.
- Enter an appropriate comment, and then choose to either Approve or Reject.

### Challenge 3

Evaluate the provided sample code using Cloud9 IDE. In the application.json file, change the security group definition to 0.0.0.0/0. Then, commit your changes to the repository using Cloud9 IDE. Observe how your pipeline reacts. For clues to complete the challenge, select the + symbol.

#### Clues

- In AWS Cloud 9 console, select the CI-CD environment.
- Open the file CI-CD/cloudformation/application.json.
- Change the CIDR IP in line 47 to 0.0.0.0/0.
- Save and push your changes to your repository.

### Challenge 4

Perform a pull request and a review for the sample application code change. For clues to complete the challenge, select the + symbol.

#### Clues

- In AWS Cloud 9 console, select the CI-CD environment.
- In the CI-CD repository, create a feature branch for your new changes.
- Make changes to any file (for example, /CI-CD/index.html). Push the changes to the new branch.
- In AWS CodeCommit console, select the CI-CD repository and create a pull request.
- In a real-world environment, reviewers approve or provide feedback before changes are merged to a repository. For this exercise, merge the changes to the repository.

### Challenge 5

Review the Service_Stage in the release pipeline to understand how the synthetic testing was set up. Make the code changes to index.html to fail the testing. For clues to complete the challenge, select the + symbol.

#### Clues

- In AWS Cloud 9 console, select the CI-CD environment.
- Open the file /CI-CD/index.html.
- In line 55, change the sample application name from Simple to Complex.
- Push the changes to the master branch. Observe that the releasePipeline fails at the Service_Stage.

>Remember to delete the resources when you have finished your experimentation. Delete the CloudFromation stacks cicd-demo, cicd-demo-test-stack, and cicd-demo-prod-stack. 