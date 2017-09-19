/**
 * Created by schulace on 9/18/17.
 */
$.ajax('/api/posts', {
    success:fillPosts
});
/**
 * fills in all posts from an API request
 * @param data a json string representing the data as an array
 */
function fillPosts(data){
    const obj = data;
    //create a table to put everything into
    //table gets a row for each post in the database
    const table = $('<table>', {id:'postsTable'});
    for(let i = 0; i < obj.length; i++) {
        //each row has the score, the title, and an expand button (more detail later)
        const row = $('<tr>', {id:'postRow'+obj[i].id});
        const titleTextCol = $('<td>', {id:'item'+obj[i].id, text:obj[i].title});
        const scoreCol = $('<td>');
        const scoreDiv = $('<div>', {text:obj[i].score, id:obj[i].id + 'score'});
        const upDoot = $('<button>', {text:'up'});
        upDoot.click(() => {
            $.ajax('/api/posts/'+ obj[i].id,{
                type:'POST',
                data: {direction:'up'},
                dataType:'json',
                success: function(input) {
                    //set associated score div to the updated score
                    $('#' + obj[i].id + 'score').text(input.score);
                },
                error: (data) => console.log(data)
            })
        });
        const downDoot = $('<button>', {text:'down'});
        downDoot.click(() => {
            $.ajax('/api/posts/'+ obj[i].id,{
                type:'POST',
                data: {direction:'down'},
                dataType:'json',
                success: function(input) {
                    //set associated score div to the updated score
                    $('#' + obj[i].id + 'score').text(input.score);
                },
                error: (data) => console.log(data)
            })
        });
        scoreCol.append(upDoot).append(scoreDiv).append(downDoot);
        row.append(scoreCol);
        row.append(titleTextCol);
        const expandBtn = $('<button>', {id:'expand'+obj[i].id, text:'expand', class:'unexpanded'});
        //shows the next spanning row and fills it if not already filled
        //this needs to be placed here in because the function is different for each button based on obj[i].id
        expandBtn.click(() => {
            //selecting next tr
            const next = $('#unexpandedRow'+obj[i].id);
            //if the text for the next thing is  empty, does an AJAX request for the body
            if (next.first().text() == '') {
                $.ajax('/api/posts/' + obj[i].id, {
                    type:'GET',
                    dataType:'json',
                    success: function (data) {
                        next.children().text(data.body);
                        next.toggle();
                        expandBtn.text('collapse');
                    }
                });
            //else just toggles its visibility
            } else {
                expandBtn.text(expandBtn.text() == 'expand' ? 'collapse':'expand');
                next.toggle();
            }
        });
        row.append($('<td>').append(expandBtn));
        //a row spanning the entire table which will display the post body text if expand is clicked
        const row2 = $('<tr>',{ id:'unexpandedRow'+obj[i].id});
        row2.append($('<td>', {text:'', colspan:'3'})).hide();
        table.append(row).append(row2);
    }
    $('#posts').append(table);
}
