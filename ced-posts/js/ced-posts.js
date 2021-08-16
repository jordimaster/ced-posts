// List posts in draft status of current logged-in user
function cedListPosts() {
	jQuery.ajax({
		method: "GET",
		url: mainData.root + "wp/v2/posts?_fields=title,id&orderby=date&order=desc&status=draft&author=" +  mainData.userid,
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
		},
		success : function( response ) {
			jQuery.each(response, function(i, post){
				jQuery('.ced-container').append('<div class="ced-post" onclick="cedRetrievePost(' + post.id + ')">'+ post.title['rendered'] + '</div>');
			});
		},
		error : function( response ) {
			jQuery('.ced-container').html('Error while retrieving posts. Please reload page');
		}
	});
}


// Set data of new post
function cedSetDataNewPost( image_id ){
	let title_post = jQuery( '#cp-post-title' ).val();
	let content_post = jQuery( '#cp-post-content' ).val();
	jQuery.ajax({
		method: "POST",
		url: mainData.root + 'wp/v2/posts',
		data: {
			title: title_post,
			content: content_post,
			featured_media: image_id
		},
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
		},
		success : function( response ) {
			// After creating the new post the modal is closed and cleared
			alert( 'Created new post with id: ' + response.id );
			jQuery("#createPost").css("display","none");
			jQuery("#cp-post-title, #cp-post-content, #cp-post-featured-image").val('');
			cedFillPosts(cedListPosts);
		},
		error : function( response ) {
			alert( 'Unexpected error.\nPlease try again' );
		}
	});
}


// Full function to create new post
function cedCreatePost() {
	let title_post = jQuery( '#cp-post-title' ).val();
	if ( ! title_post.length ) {
		alert( 'The title can\'t be empty' );
		return;
	}
	let content_post = jQuery( '#cp-post-content' ).val();
	if ( ! content_post.length ) {
		alert( 'The content can\'t be empty' );
		return;
	}
	let file = jQuery( '#cp-post-featured-image' )[0].files[0];
	if ( 'undefined' === typeof( file ) ) {
		alert( 'The featured image can\'t be empty' );
		return;
	}
	let formData = new FormData();
	formData.append( 'file', file );
	// Upload image
	jQuery.ajax( {
		url: mainData.root + 'wp/v2/media/',
		method: 'POST',
		processData: false,
		contentType: false,
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
		},
		data: formData
	} ).success( function ( response ) {
		// Only after uploading the image it's possible to send data to create the new post
		cedSetDataNewPost( response.id );
	} ).error( function( response ) {
		alert( 'Unexpected error.\nPlease try again' );
	});
}


// List posts including the most recent post created
function cedFillPosts(listposts){
	jQuery(".ced-post").remove();
	listposts();
}


// Retrieve post data
function cedRetrievePost(id) {
	jQuery.ajax({
		method: "GET",
		url: mainData.root + "wp/v2/posts/" + id + "?_embed&author=" +  mainData.userid,
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
		},
		success : function( response ) {
			jQuery( '#editPost' ).css( 'display', 'block' );
			jQuery( '#editPost .ced-modal-submit-btn' ).attr( "data-idpost", response.id );
			jQuery( '#ep-post-title' ).val( response.title['rendered'] );
			jQuery( '#ep-post-content' ).val( response.content['rendered'] );
			if ( !response.featured_media ) {
				jQuery( '#current-post-featured-image' ).attr( "data-idimage", 0 ); 
				return;
			}
			jQuery( '#current-post-featured-image' ).text( response._embedded['wp:featuredmedia'][0].media_details.sizes.full.file ).attr( "data-idimage", response.featured_media );
		},
		error : function( response ) {
			alert('Error while retrieving post. Please try again');
		}
	});
}


// Update data of post
function cedUpdateDataPost( id, image_id ){
	let title_post = jQuery( '#ep-post-title' ).val();
	let content_post = jQuery( '#ep-post-content' ).val();
	jQuery.ajax({
		method: "POST",
		url: mainData.root + 'wp/v2/posts/' + id,
		data: {
			title: title_post,
			content: content_post,
			featured_media: image_id
		},
		beforeSend: function ( xhr ) {
			xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
		},
		success : function( response ) {
			// After updating the post the modal is closed and cleared
			alert( 'Post with id: ' + id + ' edited successfully' );
			jQuery("#editPost").css("display","none");
			jQuery("#ep-post-title, #ep-post-content, #ep-post-featured-image").val('');
			cedFillPosts(cedListPosts);
		},
		error : function( response ) {
			alert( 'Unexpected error.\nPlease try again' );
		}
	});
}


// Full function to edit post
function cedEditPost(id) {
	let title_post = jQuery( '#ep-post-title' ).val();
	if ( ! title_post.length ) {
		alert( 'The title can\'t be empty' );
		return;
	}
	let content_post = jQuery( '#ep-post-content' ).val();
	if ( ! content_post.length ) {
		alert( 'The content can\'t be empty' );
		return;
	}
	let file = jQuery( '#ep-post-featured-image' )[0].files[0];
	if ( 'undefined' === typeof( file ) ) {
		// User didn't choose a new image
		let image_id = jQuery( '#current-post-featured-image' ).attr( "data-idimage" ); 
		cedUpdateDataPost( id, image_id );
	}
	else {
		let formData = new FormData();
		formData.append( 'file', file );
		// Upload image
		jQuery.ajax( {
			url: mainData.root + 'wp/v2/media/',
			method: 'POST',
			processData: false,
			contentType: false,
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', mainData.nonce );
			},
			data: formData
		} ).success( function ( response ) {
			// After uploading the image its id is sent to update post
			cedUpdateDataPost( id, response.id );
		} ).error( function( response ) {
			alert( 'Unexpected error.\nPlease try again' );
		});
	}
}


// More actions for Create Edit Post Plugin
function cedActions() {
	// Open Create Post modal
	jQuery(".ced-create").click(function(){
		jQuery("#createPost").css("display","block");
	});

	// Submit data of new post for its creation
	jQuery( '#createPost .ced-modal-submit-btn' ).click( function( event ) {
		event.preventDefault();
		cedCreatePost();
	});

	// Close and clear modals
	jQuery(".ced-modal-close, .ced-modal-cancel-btn").click(function(){
		jQuery(this).parents(".ced-modal").css("display","none");
		jQuery(this).parents(".ced-modal").find("input, textarea").val('');
		jQuery(this).parents(".ced-modal").find("#current-post-featured-image").text('');
		jQuery(this).parents(".ced-modal").find(".ced-modal-submit-btn").removeAttr("data-idpost");
		jQuery(this).parents(".ced-modal").find("#current-post-featured-image").removeAttr("data-idimage"); 
	});

	// Update data of selected post
	jQuery( '#editPost .ced-modal-submit-btn' ).click( function( event ) {
		event.preventDefault();
		let idpost = jQuery(this).attr( "data-idpost" );
		cedEditPost(idpost);
	});
}

jQuery( document ).ready( function() {
	cedListPosts();
	cedActions();
});

