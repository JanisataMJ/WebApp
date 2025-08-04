export interface CommentProps {
  ID: number;
  description: string;
  user_id: number;
  novel_id: number;
  User: { // Ensure `User` is correctly populated
    user_name: string,
    profile: string, // Default to empty string if not present
  },
}
