import { createHttpLink } from "apollo-link-http";
import { ConstructApolloClient, GenerateHeader } from "./ClientUtils";
import { ApolloLink } from "apollo-link";

const ConstructClient = graphqlURL => {
  return new BasicClient(graphqlURL);
};

class BasicClient {
  constructor(graphqlURL, apolloClientOptions = {}) {
    this.endpoint = graphqlURL;
    this.httpLink = null;
    this.client = null;
    
    this.apolloClientOptions = apolloClientOptions;

    this.reset();
  }

  reset() {
    this.httpLink = new createHttpLink({ uri: this.endpoint });
    this.client = ConstructApolloClient(this.httpLink, this.apolloClientOptions);
  }

  setToken(token) {
    if (!token) return false;

    let middlewareLink = new ApolloLink((operation, forward) => {
      operation.setContext(GenerateHeader(token));
      return forward(operation);
    });

    const link = middlewareLink.concat(this.httpLink);
    this.client = ConstructApolloClient(link, this.apolloClientOptions);
  }
}

export default ConstructClient;
