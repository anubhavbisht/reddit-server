import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { createClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../graphql/generated/graphql";
import { convertToIST } from "../utils/dateFormatter";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery()
  return (
    <>
      <Navbar />
      <div>Posts..........</div>
      {!fetching && !data ? <div>Loading......</div> : data?.posts.map((p) => {
        return (<div key={p.id}>{p.title} {convertToIST(p.createdAt)}</div>)
      })}
    </>
  )
};

export default withUrqlClient(createClient, { ssr: false })(Index);
