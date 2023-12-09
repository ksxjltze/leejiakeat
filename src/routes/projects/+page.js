export const load = async ({ fetch }) => {
	const response = await fetch(`/api/projects`);
	const posts = await response.json();

	return {
		posts
	};
};