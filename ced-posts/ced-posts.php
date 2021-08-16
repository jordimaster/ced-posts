<?php
/**
 * Plugin Name:       Create Edit Posts
 * Description:       Plugin that allows to create draft posts and edit the current user's draft posts in the frontend of a site. Use the shortcode [create_edit_posts]
 * Version:           1.0
 * Requires at least: 4.7
 * Author:            Jordi Farre
 * License:           GPL v2
 * License URI:       LICENSE.txt
 */

function ced_posts_css_js() {
	if ( is_user_logged_in() ) {
		wp_enqueue_style( 'ced-styles', plugin_dir_url( __FILE__ ) . 'css/ced-posts.css' );
		$user_ID = get_current_user_id();
		$site_url = get_site_url();
		wp_enqueue_script( 'ced-scripts', plugin_dir_url( __FILE__ ) . 'js/ced-posts.js', array('jquery') );
		wp_localize_script( 'ced-scripts', 'mainData', array(
			'userid' => $user_ID,
			'root' => esc_url_raw( rest_url() ),
			'nonce' => wp_create_nonce( 'wp_rest' )
		) );
	}
}
add_action( 'wp_enqueue_scripts', 'ced_posts_css_js' );


add_shortcode( 'create_edit_posts', function() {
	if ( is_user_logged_in() ) {
		$out = '<div class="ced-container">
			<button class="ced-create">CREATE POST</button>
			<hr><h3>EDIT POSTS</h3>
		</div>
		<div id="createPost" class="ced-modal">
			<span class="ced-modal-close" title="Close">&times;</span>
			<form class="ced-modal-content" method="post" name="createPost">
				<h2 class="ced-modal-title">Create Post</h2>
				<p>
					<label for="cp-post-title">Title</label>
					<input id="cp-post-title" type="text" required>
				</p>
				<p>
					<label for="cp-post-content">Content</label>
					<textarea id="cp-post-content" required></textarea>
				</p>
				<p>
					<label for="cp-post-featured-image">Featured Image</label>
					<input id="cp-post-featured-image" type="file" accept=".jpg, .png, .gif" required>
				</p>
				<div class="clearfix">
					<button type="submit" value="Submit" class="ced-modal-submit-btn">Submit</button>
					<button type="button" class="ced-modal-cancel-btn">Cancel</button>
				</div>
			</form>
		</div>
		<div id="editPost" class="ced-modal">
			<span class="ced-modal-close" title="Close">&times;</span>
			<form class="ced-modal-content" method="post" name="editPost">
				<h2 class="ced-modal-title">Edit Post</h2>
				<p>
					<label for="ep-post-title">Title</label>
					<input id="ep-post-title" type="text" required>
				</p>
				<p>
					<label for="ep-post-content">Content</label>
					<textarea id="ep-post-content" required></textarea>
				</p>
				<p>
					<label>Current Featured Image:</label>
					<span id="current-post-featured-image"></span>
				</p>
				<p>
					<label for="ep-post-featured-image">New Featured Image</label>
					<input id="ep-post-featured-image" type="file" accept=".jpg, .png, .gif" required>
				</p>
				<div class="clearfix">
					<button type="submit" value="Submit" class="ced-modal-submit-btn">Update</button>
					<button type="button" class="ced-modal-cancel-btn">Cancel</button>
				</div>
			</form>
		</div>';
		return $out;
	}
} );
