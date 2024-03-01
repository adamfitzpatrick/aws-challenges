import assert from 'assert';
import http from 'http';
import console from 'console';
import {
    CodePipelineClient,
    PutJobSuccessResultCommand,
    PutJobFailureResultCommand
} from '@aws-sdk/client-codepipeline';

export const handler = async function(event, context) {
    console.log(JSON.stringify(event))
    var codePipelineClient = new CodePipelineClient();

    // Retrieve the Job ID from the Lambda action
    const jobId = event["CodePipeline.job"].id;

    // Retrieve the value of UserParameters from the Lambda action configuration in AWS CodePipeline, in this case a URL which will be
    // health checked by this function.
    const url = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters;

    // Notify AWS CodePipeline of a successful job
    const putJobSuccess = async function(message) {
        const input = {
            jobId: jobId
        };
        const command = new PutJobSuccessResultCommand(input);
        return await codePipelineClient.send(command);
    };

    // Notify AWS CodePipeline of a failed job
    const putJobFailure = async function(message) {
        const input = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(message),
                type: 'JobFailed',
                externalExecutionId: context.invokeid
            }
        };
        const command = new PutJobFailureResultCommand(input);
        return await codePipelineClient.send(command);
    };

    // Validate the URL passed in UserParameters
    if(!url || url.indexOf('http://') === -1) {
        return await putJobFailure('The UserParameters field must contain a valid URL address to test, including http:// or https://');
    }

    // Helper function to make a HTTP GET request to the page.
    // The helper will test the response and succeed or fail the job accordingly
    var getPage = async function(url) {
        const pageObject = {
            body: '',
            statusCode: 0,
            contains: function(search) {
                return this.body.indexOf(search) > -1;
            }
        };
        const promise = new Promise((resolve, reject) => {
            http.get(url, function(response) {
                pageObject.body = '';
                pageObject.statusCode = response.statusCode;
    
                response.on('data', function (chunk) {
                    pageObject.body += chunk;
                });
    
                response.on('end', function () {
                    resolve(pageObject);
                });
    
                response.resume();
            }).on('error', function(error) {
                // Fail the job if our request failed
                reject(error)
            });
        });
        
        return promise;
    };
    
    try {
        const returnedPage = await getPage(url);
        
        console.log("checking for status code 200");
        assert(returnedPage.statusCode === 200);
        
        // You can change this to check for different text, or add other tests as required
        console.log("Confirming that the page contains 'Simple Calculator Service'");
        assert(returnedPage.contains('Simple Calculator Service'));

        // Succeed the job
        console.log("Tests passed.");
        return putJobSuccess("Tests passed");
    } catch (ex) {
        // If any of the assertions failed then fail the job
        console.log(ex);
        return putJobFailure(ex);
    }
}