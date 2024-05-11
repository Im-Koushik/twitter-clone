export const getPostEndpoint = ({ feedType, username, userId }) => {
  switch (feedType) {
    case "forYou":
      return "/api/posts/all";
    case "following":
      return "/api/posts/following";
    case "posts":
      return `/api/posts/user/${username}`;
    case "likes":
      return `/api/posts/likes/${userId}`;
    case "bookmarks":
      return `/api/posts/bookmarks/${userId}`;
    default:
      return "/api/posts/all";
  }
};
