import { useEffect } from "react";
import Router from "next/router";

import useRequest from "../../hooks/use-request";

const SignOut = () => {
  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => doRequest(), []);

  return <div style={{ padding: 50 }}>Signing you out...</div>;
};

export default SignOut;
