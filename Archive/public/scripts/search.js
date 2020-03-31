$('.real-search').on('input', function() {
    var search = $(this).serialize();
    if (search === "all") {
        search = "all"
    }
    $.get('/photoboards?' + search, function (searched) {
        let s = Math.ceil(searched.length / 3);
        $('.search-show').html('');
            $('.search-show').append(`
            <div class="photoColumn search-show1"></div>
            <div class="photoColumn search-show2"></div>
            <div class="photoColumn search-show3"></div>
            `);

        for (let i = 0; i < s; i++) {
            $('.search-show1').append(`
                <div class="figure" style="margin: 20px 40px">
                    <img class="figure-img img-fluid rounded img-thumbnail" src="${searched[i].image}">
                    
                    <div class="avatar-on-figure">
                        <a href="/users/${searched[i].author.id}">
                            <img class="rounded-circle zoom-avatar" src="${searched[i].author.avatar}" width="30" height="30">
                        </a>
                        <p class="textShadow" style="color: white; margin-left: 10px">${searched[i].author.username}<p>
                    </div>
                    <div><a class="btn btn-light btn-sm img-text" role="button" href="/photoboards/${searched[i]._id}" >View More</a></div>
                </div>`);
        }
        for (let i = s; i < 2 * s; i++) {
            $('.search-show2').append(`
                <div class="figure" style="margin: 20px 40px">
                    <img class="figure-img img-fluid rounded img-thumbnail" src="${searched[i].image}">
                    
                    <div class="avatar-on-figure">
                        <a href="/users/${searched[i].author.id}">
                            <img class="rounded-circle zoom-avatar" src="${searched[i].author.avatar}" width="30" height="30">
                        </a>
                        <p class="textShadow" style="color: white; margin-left: 10px">${searched[i].author.username}<p>
                    </div>
                    <div><a class="btn btn-light btn-sm img-text" role="button" href="/photoboards/${searched[i]._id}" >View More</a></div>
                </div>`);

        }
        for (let i = 2 * s; i < searched.length; i++) {
            $('.search-show3').append(`
                <div class="figure" style="margin: 20px 40px">
                    <img class="figure-img img-fluid rounded img-thumbnail" src="${searched[i].image}">
                    
                    <div class="avatar-on-figure">
                        <a href="/users/${searched[i].author.id}">
                            <img class="rounded-circle zoom-avatar" src="${searched[i].author.avatar}" width="30" height="30">
                        </a>
                        <p class="textShadow" style="color: white; margin-left: 10px">${searched[i].author.username}<p>
                    </div>
                    <div><a class="btn btn-light btn-sm img-text" role="button" href="/photoboards/${searched[i]._id}" >View More</a></div>
                </div>`);
        }
    });
});



$('.real-search').submit(function(event) {
    event.preventDefault();
});