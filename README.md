# Apollo Client Extension
This is an extension of the existing ``ApolloClient``. <br>
The extension contains the following features:
- variable request timeouts
- a response parser
- status listeners
- error outputting
- execption handling query/mutations

```js
import ApolloClientExtent from "apollo-client-extension";
const client = new ApolloClientExtent(/* client data */, {
    autoParse: true,
    subData: "",
    timeoutMS: 15000,
    timeoutMsg: "timed out",
    defaultReturn: undefined
});
```

|Parameter |Type | Description|
|---|---|---|
|clientData|``object``|this is the data you would normally pass to your ``ApolloClient``
|options|``object``|this is the fallback options to be used throughout the client's lifetime when options are not otherwised specified|
<br>

## Options (timeouts & response parser)
The existing options are as follows:
|Option|Type|Description|
|---|---|---|
|autoParse|`bool`|If true, it will attempt to parse out the value from the response. Meaning that normally, a response is structured as follows: `response.data.MyQuery`, where `MyQuery` is the one holding your value(s). If you set `autopParse` to `true`, then it'll attempt to parse out the data from the response. Meaning that instead of receiving the object `data.MyQuery`, you receive the value directly into your response variable - Example: <br> - without parsing: `{data: MyQuery: 123}` <br> - with parsing: `123` <br><br> The nature of the parsing is determine by the next option `subData`|
|subData|`string`|If `subData` is specified, then it will attempt to parse out the object with the same name as `subData`. <br> So, for example, if the response has the following structure: `data.MyQuery`, and `subData: "MyQuery"`, then it will extract the value from  "MyQuery", and return that.<br> If you set `subData` to be an empty string (""), then it will automatically attempt to extract the value, using the name of the query.|
|timeoutMS|`number`|Is how long the request should last in miliseconds, before it terminates the request and throws an error|
|timeoutMsg|`string`|Is the error message to throw when the client throws a timeout error|
|defaultReturn|`any`|This is the return value, specific to the auto exception handling methods `queryTry` and `mutateTry`. They are mentioned further down. 

__NOTE__: If no options are passed in, then the default object, `DefaultOptions`, is used . This object is a non-default export (i.e. it is accessible if needed).
<br><br>

## use (status listeners & error outputting)
There are two use methods. Both exist for monitoring purposes.
They both return themselves, allowing for chaning the methods, as so 
```js
client.useStatusOutput(/*...*/).useStatusOutput(/*...*/)
```
This has no other purpose other than a quality of life experience. 

### Status Output
```js
client.useStatusOutput(status => {
    // status: True | False
});
```
Any methods added to `useStatusOutput`, will be called with the current load status everytime it changes.<br>
Meaning that, whenever it has started to load, the listening methods are called with a parameter that is `true`, and when it finishes the request, the methods are called with a paramater with the value `false`.

<br>

### Error Output
```js
client.useErrorOutput(error => {
    // error: any
});
```
Any methods added to `useErrorOutput`, will be called when `queryTry` or `mutateTry` catch an error. The parameter is the error that was caught.

## Methods (execption handling query/mutations)
__NOTE__: At this time, no extension support exists for subscriptions, only query and mutation

There are two types of request methods.
 - Standard
 - Automatic error handling

The Standard, is your box-standard `ApolloClient` request method:

```js
try {
    await client.query({query: MyQuery, variables: {bob: 123}});
    await client.mutate({mutation: MyQuery, variables: {bob: 123}});
} catch(error) {
    console.log("Caught an error:", error);
}
```

and the automatic error handlers function the same way, only it does the `try catch` for you:
```js
await client.queryTry({query: MyQuery, variables: {bob: 123}});
await client.mutateTry({mutation: MyQuery, variables: {bob: 123}});
```
The return value is determined by the _options_ parameter mentioned previously (`defaultReturn`).
Additionally, these methods, will route the caught errors through the `useErrorOutput`, allowing for handling error outputting automatically.

<br>
All of these methods have the same structure, which is as follows:

```js
    await client.query(/* apollo data */, /* options */);
    await client.mutate(/* apollo data */, /* options */);
    await client.queryTry(/* apollo data */, /* options */);
    await client.mutateTry(/* apollo data */, /* options */);
```
These options are the same as the ones mentioned in the beginning. The purpose of being able to pass in options here too, is to control any custom behaviour, without having to type out each option everytime.<br>
Basically, if a parameter is not specified in your new options, it will auto fill it with the default one specified when the client was constructed. 

```js
    await client.query(/* apollo data */, {
        autoParse: true, 
     // subData: "",
     // timeoutMS: 15000,
     // timeoutMsg: "timed out",
     // defaultReturn: undefined
    });
```
