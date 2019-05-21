import _ from "lodash";
import { ApolloClient } from 'apollo-client';
import PromiseTimeout from '@jostft/promise-timeout';

export const DefaultOptions = {
    autoParse: true,
    subData: "",
    timeoutMS: 15000, // miliseconds
    timeoutMsg: "timed out",
    
    // ? specific to queryTry, and mutateTry
    defaultReturn: undefined
};

export default class ApolloClientExtent extends ApolloClient {
    constructor(clientData, options = DefaultOptions) {
        super(clientData);
        this.statusOutputs = [];
        this.errorOutputs = [];

        this.defaultOptions = options;

        this.useStatusOutput = this.useStatusOutput.bind(this);
        this.useErrorOutput = this.useErrorOutput.bind(this);
        this.clear = this.clear.bind(this);
        this.clearErrorOutput = this.clearErrorOutput.bind(this);
        this.callStatusOutputs = this.callStatusOutputs.bind(this);
        this.callErrorOutputs = this.callErrorOutputs.bind(this);
        
        this.getOptions = this.getOptions.bind(this);

        this.execute = this.execute.bind(this);
        this.requestTry = this.requestTry.bind(this);

        this.query = this.query.bind(this);
        this.queryTry = this.queryTry.bind(this);
        this.mutate = this.mutate.bind(this);
        this.mutateTry = this.mutateTry.bind(this);
    }

    // _________________________________________________________________
    // @ Outputting
    useStatusOutput(statusMethod) {
        if(_.isFunction(statusMethod))
            this.statusOutputs.push(statusMethod);
        return this;
    }

    useErrorOutput(errorMethod) {
        if(_.isFunction(errorMethod))
            this.errorOutputs.push(errorMethod);
        return this;
    }

    clear() {
        this.statusOutputs = [];
        return this;
    }

    clearErrorOutput() {
        this.errorOutputs = [];
        return this;
    }

    callStatusOutputs(status) {
        _.forEach(this.statusOutputs, s => s(status));
    }
    callErrorOutputs(error) {
        _.forEach(this.errorOutputs, s => s(error));
    }

    // _________________________________________________________________
    // @ Option Handling
    getOptions(options = {}) {
        return _.assign(options, this.defaultOptions);
    }

    // _________________________________________________________________
    // @ Executions 
    async execute(promise, requestName, options) {
        const {autoParse, timeoutMS, timeoutMsg} = this.getOptions(options);

        this.callStatusOutputs(true);
        const result = await PromiseTimeout(timeoutMS, timeoutMsg, promise);
        this.callStatusOutputs(false);
        
        if(!autoParse) return result;
        
        if(result.data === undefined || result.data[requestName] === undefined)
        throw "Invalid Response Data";
        
        return result.data[requestName];
    }

    async requestTry(request, method, options) {
        const ops = this.getOptions(options);
        const {defaultReturn} = ops;

        try {
            return await method(request, ops);
        } catch(error) {
            this.callErrorOutputs(error);
            return defaultReturn;
        }
    }

    // _________________________________________________________________
    // @ Public Methods
    async query(request, options = {}) {
        let ops = this.getOptions(options);
        if (!ops.subData) ops.subData = request.query.definitions[0].name.value;
        return await this.execute(super.query(request), ops.subData, options);
    }

    async queryTry(request, options = {}) {
        await this.requestTry(request, this.query, options);
    }
    
    async mutate(request, options = {}) {
        let ops = this.getOptions(options);
        if (!ops.subData) ops.subData = request.mutation.definitions[0].name.value;
        return await this.execute(super.query(request), ops.subData, options);
    }

    async mutateTry(request, options = {}) {
        await this.requestTry(request, this.mutate, options);
    }
}