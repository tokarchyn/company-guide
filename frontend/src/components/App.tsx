import { AzureMap } from "components/Map";
import styled from "@emotion/styled";
import { Panel } from "./Panel";
import { useAppDispatch, useAppSelector } from "store/store";
import { signIn } from "store/userSlice";
import { memo, useCallback, useEffect } from "react";
import { MsalProvider } from "@azure/msal-react";
import { IPublicClientApplication } from "@azure/msal-browser";

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-content: stretch;
`;

const UnauthenticatedContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const UnauthenticatedContent = memo(() => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(signIn());
  }, []);

  const signInCallback = useCallback(() => {
    dispatch(signIn());
  }, [dispatch]);

  return (
    <UnauthenticatedContainer>
      {user.error && <div>{user.error.message}</div>}
      {user.error && !user.loading && (
        <button onClick={signInCallback} style={{height: "30px"}}>Sing in</button>
      )}
      {user.loading && <div>Sign-in in opened popup window.</div>}
    </UnauthenticatedContainer>
  );
})

function App() {
  const profile = useAppSelector((state) => state.user.profile);

  return profile ? (
    <Container>
      <AzureMap />
      <Panel />
    </Container>
  ) : (
    <UnauthenticatedContent />
  );
}

export default App;
