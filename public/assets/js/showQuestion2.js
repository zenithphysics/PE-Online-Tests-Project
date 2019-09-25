$(function () {
    // alert("I'm ready")
    // Exam Logic
    viewdiv = 1
    viewrow = 1
    viewqueNo = 1
    answers = {
        "Question1": "2",
        "Question2": "3",
        "Question3": "4"
    }
    createDivs()
    createQNo()
    showdiv()

    // Page Logic
    height = $(".header").height();
    $(".mainContainer").css("top", height);
    Width = $(window).width();
    if (Width > 1000) {
        $(".slider").click(function (e) {
            e.preventDefault();
            // alert()
            $(".rightSide").toggleClass("sideLength1");
            $(".leftSide").toggleClass("col-xl-12 col-lg-12 col-md-12 ")
        });
    }
    else {
        $(".slider").click(function (e) {
            e.preventDefault();
            // alert()
            $(".rightSide").toggleClass("sideLength");
        });
    }

    $(".radio-btn").click(function (e) {
        e.preventDefault();
        // alert()
        if (!$(".radio-btn").hasClass("btn-primary")) {
            $(this).children("input").attr('checked', true)
            $(this).toggleClass("btn-primary");
        } else {
            $(".radio-btn input").attr('checked', false)
            $(".radio-btn ").removeClass("btn-primary")
            $(this).children("input").attr('checked', true)
            $(this).toggleClass("btn-primary");
        }
    });
    // $(".radio-btn").css("transition", "transform .3s ease-in-out");

    // $(".radio-btn").hover(
    //     // Handler for mouseenter
    //     function () {
    //         $(this).css("transform", "scale(1.2)");
    //         $(this).css("background-position", "right center");

    //     },
    //     // Handler for mouseleave
    //     function () {
    //         $(this).css("transform", "scale(1)");
    //     }
    // );


    // Counter
    var initialSecs = 10800;
    var currentSecs = initialSecs;
    setTimeout(decrement, 1000);

    function decrement() {
        var displayedSecs = currentSecs % 60;
        var displayedMin = Math.floor(currentSecs / 60) % 60;
        var displayedHrs = Math.floor(currentSecs / 60 / 60);
        if (displayedMin <= 9) displayedMin = "0" + displayedMin;
        if (displayedSecs <= 9) displayedSecs = "0" + displayedSecs;
        currentSecs--;
        $(".remainCounter").html("[" + displayedHrs + ":" + displayedMin + ":" +
            displayedSecs + "]");
        if (currentSecs !== -1) setTimeout(decrement, 1000);
    }

    function createDivs() {
        for (let index = 1; index <= 90; index++) {
            $(".Questions").append(`<div class="Question">
            <div class="d-flex justify-content-between row ml-1 pb-2 w-100" style="border-bottom: 3px solid #25b5e9;color: #333;font-size:1.5vw">
                <div class="flex-1 font-weight-bold">Question No: ` + index + `</div>
                <div class="flex-1 text-right font-weight-bold">Single Choice Type Question</div>
            </div>
            <div class="row w-100 ml-1">
                <img class="QuestionImg" src="assets/images/questions/` + index + `.png" alt="">
                <table class="table table-borderless mt-2">
                    <tbody>
                    <tr class="d-flex justify-content-center">
                    <td class="d-flex flex-1 justify-content-center align-items-center">
                        <label class="radio-btn">
                            <input type="radio" value="1" name="Question` + index + `" class="">
                            Option 1
                        </label>
                    </td>
                    <td class="d-flex flex-1 justify-content-center align-items-center">
                        <label class="radio-btn">
                            <input type="radio" value="2" name="Question` + index + `" class="">
                            Option 2
                        </label>
                    </td>
                    <td class="d-flex flex-1 justify-content-center align-items-center">
                        <label class="radio-btn">
                            <input type="radio" value="3" name="Question` + index + `" class="">
                            Option 3
                        </label>
                    </td>
                    <td class="d-flex flex-1 justify-content-center align-items-center">
                        <label class="radio-btn">
                            <input type="radio" value="4" name="Question` + index + `" class="">
                            Option 4
                        </label>
                    </td>
                </tr>
                    </tbody>
                </table>
            </div>
        </div>`);
        }
    }

    function createQNo() {
        count = 1;
        for (var i = 0; i < 9; i++) {
            var $row = $(".QnOwrapper").append("<tr class='w-100'> < td/>").children("tr:eq(" + (i) + ")");
            for (var k = 1; k <= 10; k++) {
                $row.append(`<td class="btn Quebtn unseen" data-div="` + count + `">` + count + `</td>`);
                count++;
            }
        }
    }

    function showdiv() {
        if (viewdiv <= 10) {
            viewrow = 1
        } else {
            viewrow = Math.floor(viewdiv / 10)
            viewrow = +viewrow + 1
        }
        viewqueNo = (viewdiv % 10)
        $(".Question").css("display", "none");
        $(".Question:nth-child(" + viewdiv + ")").css("display", "block");
        if (!$(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").hasClass("attempted")) {
            if (!$(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").hasClass("Ansreview")) {
                if (!$(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").hasClass("review")) {
                    $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").addClass("unattempted");
                }
            }
        }
    }

    function saveNreview() {
        if ($(".Question:nth-child(" + viewdiv + ") table tbody td input").is(":checked")) {
            if (viewdiv <= 10) {
                viewrow = 1
                viewqueNo = viewdiv
            } else {
                viewrow = Math.floor(viewdiv / 10)
                viewrow = +viewrow + 1
                viewqueNo = (viewdiv % 10)
            }
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").removeClass("unattempted");
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").addClass("Ansreview");
            viewdiv = +viewdiv + 1
            showdiv()
        } 
        else {
            if (viewdiv <= 10) {
                viewrow = 1
                viewqueNo = viewdiv
            } else {
                viewrow = Math.floor(viewdiv / 10)
                viewrow = +viewrow + 1
                viewqueNo = (viewdiv % 10)
            }
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").removeClass("unattempted");
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").addClass("review");
            viewdiv = +viewdiv + 1
            showdiv()
        }
    }

    // subject selection buttons 
    $(".phybtn").click(function (e) {
        e.preventDefault();
        viewdiv = 1
        $(".btnrow2 .btn").removeClass("active");
        $(this).addClass("active");
        showdiv()
    });
    $(".chembtn").click(function (e) {
        e.preventDefault();
        viewdiv = 31
        $(".btnrow2 .btn").removeClass("active");
        $(this).addClass("active");
        showdiv()
    });
    $(".biobtn").click(function (e) {
        e.preventDefault();
        viewdiv = 61
        $(".btnrow2 .btn").removeClass("active");
        $(this).addClass("active");
        showdiv()
    });
    // Save Answer Button
    $(".saveAnsbtn").click(function (e) {
        e.preventDefault();
        if ($(".Question:nth-child(" + viewdiv + ") table tbody td input").is(":checked")) {
            if (viewdiv <= 10) {
                viewrow = 1
                viewqueNo = viewdiv
            } else {
                viewrow = Math.floor(viewdiv / 10)
                viewrow = +viewrow + 1
                viewqueNo = (viewdiv % 10)
            }
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").removeClass("unattempted");
            $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").addClass("attempted");
            viewdiv = +viewdiv + 1
            showdiv()
        } else {
            alert("Select answer first to save it")
        }
    });
    // Clear response
    $(".clearAns").click(function (e) {
        e.preventDefault();
        if ($(".Question:nth-child(" + viewdiv + ") input").is(":checked")) {
            $(".Question:nth-child(" + viewdiv + ") input").prop("checked", false);
            $(".Question:nth-child(" + viewdiv + ") label").removeClass("btn-primary");
        }
        if (viewdiv <= 10) {
            viewrow = 1
            viewqueNo = viewdiv
        } else {
            viewrow = Math.floor(viewdiv / 10)
            viewrow = +viewrow + 1
            viewqueNo = (viewdiv % 10)
        }
        $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").removeClass("Ansreviewns review attempted")
        $(".QueNo tbody tr:nth-child(" + viewrow + ") td.btn:nth-child(" + viewqueNo + ")").addClass("unattempted")
    });

    // review button to mark question
    $(".reviewbtn").click(function (e) {
        e.preventDefault();
        saveNreview()
    });

     // back/next question buttons
     $(".nextbtn").click(function (e) {
        e.preventDefault();
        if(viewdiv<=90){
            viewdiv = +viewdiv + 1
        }
        showdiv()
    });

    $(".prevbtn").click(function (e) {
        e.preventDefault();
        if(viewdiv>=1){
            viewdiv = +viewdiv - 1
        }
        showdiv()
    });

    // Question selection 
    $(".Quebtn").click(function (e) {
        e.preventDefault();
        viewdiv = $(this).attr("data-div");
        if (!$(this).hasClass("attempted") && !$(this).hasClass("review") && !$(this).hasClass("Ansreview")) {
            $(this).addClass("unattempted")
            // alert(viewdiv)
            viewqueNo = 1 + $(this).index()
        }
        $(".Question").css("display", "none");
        $(".Question:nth-child(" + viewdiv + ")").css("display", "block");
    });

    // Submit the test for result
    // $(".submit").click(function (e) {
    //     e.preventDefault();
    //     data = $(".question input").serialize()
    //     data = data.split("&")
    //     // alert(data)
    //     result = {}
    //     $.each(data, function (index, val) {
    //         question = val.split("=")[0];
    //         answer = val.split("=")[1]
    //         // alert(question+":"+answer)
    //         result["" + question + ""] = "" + answer + "";
    //         // alert(JSON.stringify(result))
    //     });
    // });
});