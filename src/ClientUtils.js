import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClientExtent from "./ApolloClientExtent";

export const GenerateHeader = token => ({
  headers: { authorization: `Bearer ${token}` }
});

export const ConstructApolloClient = (
  link,
  clientOptions = {},
  cache = new InMemoryCache()
) => new ApolloClientExtent({ link, cache }, clientOptions);
