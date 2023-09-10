import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  GridRow,
  GridColumn,
  Form,
} from 'semantic-ui-react'

import {
  createPost,
  deletePost,
  getPosts,
  getUploadUrl,
  patchPost,
  uploadFile
} from '../api/posts-api'
import Auth from '../auth/Auth'
import { PostItem } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  posts: PostItem[]
  newPostTitle: string
  newPostContent: string
  loadingPosts: boolean
  file: any
  isFetching: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    posts: [],
    newPostTitle: '',
    newPostContent: '',
    loadingPosts: true,
    isFetching: false,
    file: null
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostContent: event.target.value })
  }

  onEditButtonClick = (postId: string) => {
    this.props.history.push(`/posts/${postId}/edit`)
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async () => {
    try {
      if (this.state.file === null) {
        alert('Upload a image file')
        return
      }
      this.setState({
        isFetching: true
      })
      const newPost = await createPost(this.props.auth.getIdToken(), {
        post_title: this.state.newPostTitle.trim(),
        post_content: this.state.newPostContent.trim()
      })
      const { imgPutUrl, attachmentUrl } = await getUploadUrl(
        this.props.auth.getIdToken(),
        newPost.post_id
      )
      await uploadFile(imgPutUrl, this.state.file)
      this.setState({
        posts: [
          ...this.state.posts,
          { ...newPost, attachmentUrl: attachmentUrl }
        ],
        newPostTitle: '',
        newPostContent: '',
        isFetching: false,
        file: null
      })
    } catch (e: any) {
      console.log(e)
      alert('Post creation failed')
    }
  }

  onPostDelete = async (postId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), postId)
      this.setState({
        posts: this.state.posts.filter((post) => post.post_id !== postId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const posts = await getPosts(this.props.auth.getIdToken())
      this.setState({
        posts,
        loadingPosts: false
      })
    } catch (e) {
      alert(`Failed to fetch posts: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1" style={{ textAlign: 'center', marginTop: '10px' }}>
          SOCIAL APP
        </Header>

        {this.renderCreatePostInput()}

        {this.renderPosts()}
      </div>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <h3>Please type in your post</h3>
        <Grid.Column width={16} style={{ marginBottom: '10px' }}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Your post title..."
            onChange={this.handleTitleChange}
          />
        </Grid.Column>
        <Grid.Column width={16} style={{ marginBottom: '10px' }}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Your post content..."
            onChange={this.handleContentChange}
          />
        </Grid.Column>
        <Grid.Column style={{ marginBottom: '10px' }}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
        </Grid.Column>
        <Grid.Column>{this.renderButton()}</Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
        {this.state.isFetching && this.renderLoading('Creating new post')}
      </Grid.Row>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading('Loading Posts')
    }

    return this.renderPostsList()
  }

  renderLoading(text: string) {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          {text}
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return <div>
      <h1 style={{textAlign: 'center'}}>Recent Posts</h1>
      <Divider/>
      {
        this.state.posts.map((post) => <div key = {post.post_id}>
          <div className='post_title'>
            <h3 className='title_content'>{post.post_title}</h3>
            <div className='post_buttons'>
            <Button
            icon
            color='blue'
            onClick={() => this.onEditButtonClick(post.post_id)}
            >
              <Icon name="pencil" />
            </Button>
            <Button
            icon
            color='red'
            onClick={() => this.onPostDelete(post.post_id)}
            >
              <Icon name="delete" />
            </Button>
            </div>
          </div>
          <div className='post_content'>
            <p>{post.post_content}</p>
          </div>
          <div className='post_image'>
          {post.attachmentUrl && (
              <img src={post.attachmentUrl} alt="" />
            )}
          </div>
          <Divider />
        </div>)
      }
    </div>
    // return (
    //     {this.state.posts.map((post) => {
    //       return (
    //         <Grid.Row key={post.post_id}>
    //           <Grid.Row >
    //             <Grid.Column width={14}>
    //               {post.post_title}
    //             </Grid.Column>
    //             <Grid.Column width={1} floated="right">
    //               <Button
    //                 icon
    //                 color="blue"
    //                 onClick={() => this.onEditButtonClick(post.post_id)}
    //               >
    //                 <Icon name="pencil" />
    //               </Button>
    //             </Grid.Column>
    //             <Grid.Column width={1} floated="right">
    //               <Button
    //                 icon
    //                 color="red"
    //                 onClick={() => this.onPostDelete(post.post_id)}
    //               >
    //                 <Icon name="delete" />
    //               </Button>
    //             </Grid.Column>
    //           </Grid.Row>
    //           <Grid.Row width={16} verticalAlign='middle'>
    //             {post.post_content}
    //           </Grid.Row>
    //           <Grid.Row>
    //           {post.attachmentUrl && (
    //             <Image src={post.attachmentUrl} size="small" wrapped />
    //           )}
    //           </Grid.Row>
    //           <Grid.Column width={16}>
    //             <Divider />
    //           </Grid.Column>
    //         </Grid.Row>
    //       )
    //     })}
    // )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  renderButton() {
    return (
      <div>
        <Button onClick={() => this.handleSubmit()}>Submit</Button>
      </div>
    )
  }
}
