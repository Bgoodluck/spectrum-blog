const backendUrl = 'https://spectrum-blog-server.onrender.com'


const summaryApi ={
    registerUsers:{
        url: `${backendUrl}/api/user/register`,
        method: 'POST'
    },
    loginUser:{
        url: `${backendUrl}/api/user/login`,
        method: 'POST'
    },
    authGoogle:{
        url: `${backendUrl}/api/user/google`,
        method: 'POST'
    },
    listUserProfile: {
        url: `${backendUrl}/api/profile/list`,
        method: 'GET'
    },
    updateUserProfile: {
        url: `${backendUrl}/api/profile/update`,
        method: 'PUT'
    },
    deleteUserAccount: {
        url: `${backendUrl}/api/user/delete/:userId`,
        method: 'DELETE'
    },
    loggingOff: {
        url: `${backendUrl}/api/user/signoff`,
        method: 'POST'
    },
    buildPost: {
        url: `${backendUrl}/api/post/create`,
        method: 'POST'
    },
    getAllPosts: {
        url: `${backendUrl}/api/post/get-posts`,
        method: 'GET'
    },
    getSinglePost: {
        url: `${backendUrl}/api/post/get-single-post/:postId`,
        method: 'GET'
    },
    postDelete: {
        url: `${backendUrl}/api/post/delete-post/:postId/:userId`,
        method: 'DELETE'
    },
    updatePost: {
        url: `${backendUrl}/api/post/update-post/:postId/:userId`,
        method: 'PUT'
    },
    allUsers: {
        url: `${backendUrl}/api/user/getUsers`,
        method: 'GET'
    },
    singleUser: {
        url: `${backendUrl}/api/user/obtain/:userId`,
        method: 'GET'
    },
    advertCreate: {
        url: `${backendUrl}/api/advert/create`,
        method: 'POST'
    },
    advertUpdate: {
        url: `${backendUrl}/api/advert/update/:advertId`,
        method: 'PUT'
    },
    advertGet: {
        url: `${backendUrl}/api/advert/get`,
        method: 'GET'
    },
    advertDelete: {
        url: `${backendUrl}/api/advert/delete/:advertId`,
        method: 'DELETE'
    },
    commentCreation: {
        url: `${backendUrl}/api/comment/create`,
        method: 'POST'
    },
    commentGet: {
        url: `${backendUrl}/api/comment/getPostComments/:postId`,
        method: 'GET'
    },
    commentLike: {
        url: `${backendUrl}/api/comment/likeComment/:commentId`,
        method: 'PUT'
    },
    commentEdit: {
        url: `${backendUrl}/api/comment/edit/:commentId`,
        method: 'PUT'
    },
    commentDelete: {
        url: `${backendUrl}/api/comment/delete/:commentId`,
        method: 'DELETE'
    },
    getAllComments: {
        url: `${backendUrl}/api/comment/getAllComments`,
        method: 'GET'
    },
    adminGetComments: {
        url: `${backendUrl}/api/comment/adminGetAllComments`,
        method: 'GET'
    },
    adminStarAdvertCreate: {
        url: `${backendUrl}/api/starAdvert/create`,
        method: 'POST'
    },
    adminStarAdvertDelete: {
        url: `${backendUrl}/api/starAdvert/delete/`,
        method: 'DELETE'
    },
    adminStarAdvertUpdate: {
        url: `${backendUrl}/api/starAdvert/update/`,
        method: 'PUT'
    },
    adminStarAdvertGet: {
        url: `${backendUrl}/api/starAdvert/get-now`,
        method: 'GET'
    },
    packagePayment: {
        url: `${backendUrl}/api/package/upgrade/`,
        method: 'POST'
    },
    packageStatus: {
        url: `${backendUrl}/api/package/status/`,
        method: 'GET'
    },
    initiatePayment: {
        url: `${backendUrl}/api/payment/initiate-vip-payment`,
        method: 'POST'
    },
    verifyPayment: {
        url: `${backendUrl}/api/payment/verify-vip-payment`,
        method: 'POST'
    },
    skitCreation: {
        url: `${backendUrl}/api/skit/create`,
        method: 'POST'
    },
    skitUpdate: {
        url: `${backendUrl}/api/skit/update/`,
        method: 'PUT'
    },
    skitDelete: {
        url: `${backendUrl}/api/skit/delete/`,
        method: 'DELETE'
    } ,
    skitAllGet: {
        url: `${backendUrl}/api/skit/get`,
        method: 'GET'
    } ,
    skitGetRecent: {
        url: `${backendUrl}/api/skit/recent`,
        method: 'GET'
    },
    skitGetOne: {
        url: `${backendUrl}/api/skit/get-one/`,
        method: 'GET'
    } 
}


export default summaryApi;