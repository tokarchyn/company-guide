import styled from "@emotion/styled";
import { useAppSelector } from "store/store";

const Container = styled.div`
  background-color: white;
  width: 500px;
  flex-shrink: 0;
`

export function Panel() {
  const profile = useAppSelector(state => state.user.profile);

  return (
    <Container>
      {profile?.displayName ?? 'Unauthenticated'}
    </Container>
  );
}