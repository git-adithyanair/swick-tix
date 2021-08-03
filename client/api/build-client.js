import axios from "axios";

const buildClient = ({ req }) => {
  // Basically we use this when we make the request from the server.
  // Examples for when this happens include when the user types in
  // the url for the website in the browser, force refreshes the
  // page or clicks on a link which directs them to the website.
  if (typeof window === "undefined") {
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });

    // We use this when the request is made from the browser. This
    // happens when the user moves from one page to another within
    // the website.
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
