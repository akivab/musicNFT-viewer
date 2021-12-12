import "./index.css";

import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
import React from "react";
import ReactDOM from "react-dom";
import {Route, Routes} from 'react-router';

import App from "./App";
import {BrowserRouter} from "react-router-dom";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <ApolloProvider client={client}>
      <BrowserRouter>
          <Routes>
          <Route path={"/*"} element={<App />}/>
          </Routes>
      </BrowserRouter>
  </ApolloProvider>,
  document.getElementById("root"),
);
