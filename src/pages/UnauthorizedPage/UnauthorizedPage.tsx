import ErrorState from "../../components/common/ErrorState";

const UnauthorizedPage = () => (
  <ErrorState
    code="403"
    icon="🔒"
    title="This area is staff-only."
    message="Your account doesn't have access to this page. If you think that's a mistake, contact a VeloCity administrator."
  />
);

export default UnauthorizedPage;
