/**
 * Created by schulace on 9/18/17.
 */
$.ajax('/api/posts', {
    success: fillPosts
});
/**
 * fills in all posts from an API request
 * @param data a json string representing the data as an array
 */
function fillPosts(data) {
    const obj = data;
    //create a table to put everything into
    //table gets a row for each post in the database
    const table = $('<table>', {id: 'postsTable', class: 'table'});
    for (let i = 0; i < obj.length; i++) {
        //each row has the score, the title, and an expand button (more detail later)
        const row = $('<tr>').data('post_id', data[i].id);
        const titleTextCol = $('<td>', {text: obj[i].title});
        const scoreCol = $('<td>');
        const scoreDiv = $('<div>', {text: obj[i].score});
        const upDoot = $('<button>', {text: 'up', class: 'btn'}).data('vote_value', 'up').click(vote);
        const downDoot = $('<button>', {text: 'down', class: 'btn'}).click(vote).data('vote_value', 'down');
        scoreCol.append(upDoot).append(scoreDiv).append(downDoot);
        row.append(scoreCol).append(titleTextCol);
        const expandBtn = $('<button>', {
            text: 'expand',
            class: 'btn expandButton'
        }).data('post_id', data[i].id).click(expandButton);
        row.append($('<td>').append(expandBtn));
        //a row spanning the entire table which will display the post body text if expand is clicked
        const row2 = $('<tr>', {class: 'expansionRow'}).data('post_id', data[i].id);
        row2.append($('<td>', {text: '', colspan: '3', class: 'bodyHolder'})).hide();
        table.append(row).append(row2);
    }
    $('#posts').append(table);
}
/*
 * fired when up or downvote is clicked. both are bound to this function.
 */
function vote(event) {
    $.ajax('/api/posts/' + $(event.target).parent().parent().data('post_id'), {
        type: 'POST',
        data: {direction: $(event.target).data('vote_value')},
        dataType: 'json',
        success: function (input) {
            //set associated score div to the updated score
            $(event.target).siblings('div').text(input.score);
        },
        error: (data) => console.log(data)
    });
}
/*
 * fired when expand is clicked.
 * only does a get if it hasn't gotten the info before. otherwise just shows
 */
function expandButton(event) {
    //item that fired action
    let actionFirer = $(event.target);
    const next = $('.expansionRow').filter(function (idx, elem) {
        return actionFirer.data('post_id') === $(elem).data('post_id');
    });
    if (next.first().text() == '') {
        $.ajax('/api/posts/' + $(this).parent().parent().data('post_id'), {
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                next.children().text(data.body);
                next.toggle();
                actionFirer.text('collapse');
            }
        });
    } else {
        $(this).text(actionFirer.text() == 'expand' ? 'collapse' : 'expand');
        next.toggle();
    }
}
