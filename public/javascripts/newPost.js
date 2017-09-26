/**
 * Created by schulace on 9/19/17.
 */
function submitForm() {
    $.ajax('/posts', {
        type:'PUT',
        dataType:'json',
        data:{
            title: $('#postTitle').text(),
            message: $('#postBody').text()
        }
    })
}
