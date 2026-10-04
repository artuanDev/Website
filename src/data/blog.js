// Only this public seed ships with the site. Drafts live behind database policies.
import caustics from "./blog/faking-water-caustics.json";
export const blogDrafts = [caustics];
const blogPosts = blogDrafts.filter((post) => post.published === true);
export default blogPosts;
