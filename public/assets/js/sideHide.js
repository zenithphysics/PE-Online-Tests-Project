$(function () {
    $(".hider").click(function (e) { 
        e.preventDefault();
        $(".hider i").toggleClass("fa-angle-right fa-angle-left");
        $(".Qselect").toggle();
        $(".QWrapper").toggleClass("col-xl-12 mr-0");
        $(".wrapper").toggleClass("w-100 ml-1")
        $(".QWrapper .question img").toggleClass("w-50");
    });
    
});