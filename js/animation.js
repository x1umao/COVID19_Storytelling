
$("#headImg").click(function() {
    // 动画效果
    $("#cover").fadeOut("slow")
    setTimeout(function(){
        $("#firstPage").fadeIn("slow");
      }, 800);

});


$("#map_button").click(function(){
    $("#map_button").fadeOut("slow");
    setTimeout(function(){
        merge();
        startMap();
    }, 800);

})

$("#wc_btn").click(function(){
    $("#wc_btn").fadeOut("slow")
    setTimeout(function(){
        renderWc();
      }, 800);
})