import ErrorState from "../../components/common/ErrorState";

const NotFoundPage = () => (
  <ErrorState
    code="404"
    icon="🚲💨"
    title="You've gone off-road!"
    message="The page you are looking for doesn't exist or has been moved to another garage."
  />
);

export default NotFoundPage;
