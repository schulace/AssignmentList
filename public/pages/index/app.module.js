/*
 * defined our index module (the one for the whole page)
 * and make it depend on postsPage, which will be pulled
 * from that folder
 */
angular.module('index', [
    'postsPage'
]);
