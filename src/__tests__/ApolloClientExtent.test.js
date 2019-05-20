import _ from "lodash";

class mockClass { constructor() {}};
jest.mock("apollo-client", () => ({ ApolloClient: mockClass }));
const ApolloClientExtent = require("../ApolloClientExtent").default; 
const DefaultOptions = require("../ApolloClientExtent").DefaultOptions;


describe("ApolloClientExtent", () => {
    it("construction: with options, will set the defaultOptions", () => {
        const client = new ApolloClientExtent("unreleated", {autoParse: true});
        expect(client.defaultOptions).toEqual({autoParse: true});
    });

    it("construction: without options, a static default is set", () => {
        const client = new ApolloClientExtent("unreleated");
        expect(client.defaultOptions).toEqual(DefaultOptions);
    });

    it("getOptions: should return merged option from the defaultOptions and the passed in ones", () => {
        const client = new ApolloClientExtent("unrelated", {autoParse: false, timeoutMS: 15000});
        expect(client.getOptions({timeoutMsg: "flingel"})).toEqual({
            autoParse: false,
            timeoutMsg: "flingel",
            timeoutMS: 15000
        });
    });

    it("useStatusOutput: with a function will update the status array", () => {
        const client = new ApolloClientExtent("");
        
        expect(client.statusOutputs).toHaveLength(0);
        client.useStatusOutput("not a function");
        expect(client.statusOutputs).toHaveLength(0);
        
        client.useStatusOutput(() => {});
        expect(client.statusOutputs).toHaveLength(1);
    });

    it("useErrorOutput: with a function will update the errorOutputs array", () => {
        const client = new ApolloClientExtent("");
        
        expect(client.errorOutputs).toHaveLength(0);
        client.useErrorOutput("not a function");
        expect(client.errorOutputs).toHaveLength(0);
        
        client.useErrorOutput(() => {});
        expect(client.errorOutputs).toHaveLength(1);
    });

    it("clear: should clear the statusOutputs", () => {
        const client = new ApolloClientExtent("");
        expect(client.useStatusOutput(() => {}).statusOutputs).toHaveLength(1);
        expect(client.clear().statusOutputs).toHaveLength(0);
    });
    
    it("clearErrorOutput: should clear the errorOutputs", () => {
        const client = new ApolloClientExtent("");
        expect(client.useErrorOutput(() => {}).errorOutputs).toHaveLength(1);
        expect(client.clearErrorOutput().errorOutputs).toHaveLength(0);
    });

    it("execute: should call the useStatusOutput functions with the status", async (done) => {
        const client = new ApolloClientExtent("", {autoParse: false});
        let counter = 0;
        
        client.useStatusOutput(status => {
            // ? the counter exists, only to show that before the async is called, that status function is called with a TRUE
            // ? THEN, the second time, it is called with a FALSE, indicating that it updates the status
            if(counter++ === 0)
                expect(status).toBeTruthy();
            else
            {
                expect(status).toBeFalsy();
                done();
            }
        });
        await client.execute(new Promise(resolve => resolve(true)), "query");
    });

    it("execute: should return the full request object if auto parse is NOT enabled", async () => {
        const client = new ApolloClientExtent("", {autoParse: false});
        const mockResult = {data: {MyTestRequest: "hello"}};

        const result = await client.execute(new Promise(resolve => resolve(mockResult)), "MyTestRequest");
        expect(result).toEqual(mockResult);
    });

    it("execute: should return the parsed request object, if auto parse is enabled", async () => {
        const client = new ApolloClientExtent("");
        const mockResult = {data: {MyTestRequest: "hello"}};
        const result = await client.execute(new Promise(resolve => resolve(mockResult)), "MyTestRequest");
        expect(result).toBe("hello");
    });

    it("execute: should throw an error, if data is not found, and autoparse is on", async (done) => {
        const client = new ApolloClientExtent("");
        try {
            const mockResult = {MyTestRequest: "hello"};
            await client.execute(new Promise(resolve => resolve(mockResult)), "MyTestRequest");
        } catch(error) {
            expect(error).toBe("Invalid Response Data");
            done();
        }
    });

    it("execute: should throw an error, if the request name is not found, and autoparse is on", async (done) => {
        const client = new ApolloClientExtent("");
        try {
            const mockResult = {data: {SomeOtherRequest: "hello"}};
            await client.execute(new Promise(resolve => resolve(mockResult)), "MyTestRequest");
        } catch(error) {
            expect(error).toBe("Invalid Response Data");
            done();
        }
    });

    it("requestTry: should return the result of the request", async () => {
        const client = new ApolloClientExtent("");
        await expect(client.requestTry("", () => "hello")).resolves.toBe("hello");
    });

    it("requestTry: should call the errorOutputs and return the defaultReturn", async (done) => {
    const client = new ApolloClientExtent("", {defaultReturn: 123});
    
    client.useErrorOutput((error) => {
        expect(error).toBe("my test error");
        done();
    });
    await expect(client.requestTry("", async () => { throw "my test error"; })).resolves.toBe(123);
    });
});