import { useQuery } from "@tanstack/react-query";
import Posts from "../../components/Posts";

const BookmarkPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Bookmarks</p>
        </div>
        {/* POSTS */}
        <Posts feedType="bookmarks" userId={authUser._id} />
      </div>
    </>
  );
};
export default BookmarkPage;
