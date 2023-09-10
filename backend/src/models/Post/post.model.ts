export interface PostItem {
  post_id: string;
  user_id: string;
  post_title: string;
  post_content: string;
  created_at?: string;
  modified_at?: string;
  attachmentUrl?: string;
}