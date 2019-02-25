$(document).ready(function(){
    //--var list--
    
    var list    = [],   //the list of items
        check   = [],   //things to be checked
        opened  = [];   //keep track of which items are opened



    //--autoplay--
    
    editor();

    

    //--events--

    //-site options-

    //switch between editor and example
    $(document).on("click", "#switch", function(){
        if($("#editor").length > 0){
            $("#switch").html("Editor");
            example(0);
        } else {
            $("#switch").html("Example");
            editor();
            opened.forEach(function(item){
                opener(item, list.find(x => x.item == item).text);
            });
        }
    });


    //-box options-

    //close a box
    $(document).on("click", ".close", function(){
        var parent = Number($(this).data("parent"));
        opened.splice(opened.indexOf(parent), 1);
        $("#box" + parent).remove();
        if($("#open" + parent).length > 0){
            $("#open" + parent).prop("disabled", false);
            $("#open" + parent).removeClass("disabled");
        }
    });

    //add item to list
    $(document).on("click", ".add", function(){
        var parent = Number($(this).data("parent")),
        content = $("#text" + parent).val();
        if(content.length > 0){
            addItem({parent:parent, item:itemNumber(1), text:content});
            $("#text" + parent).val("");
            fill(parent);
        } else {
            getInfo(parent, 4);
        }
    });


    //-item options-

    //open item in a box
    $(document).on("click", ".open", function(){
        var parent = Number($(this).data("item"));
        opened[opened.length] = parent;
        opener(parent, list.find(x => x.item == parent).text);
        disable("#open" + parent);
    });

    //move an item up in the list
    $(document).on("click", ".up", function(){
        var item = Number($(this).data("item"));
        move(item, -1);
    });

    //move an item down in the list
    $(document).on("click", ".down", function(){
        var item = Number($(this).data("item"));
        move(item, 1);
    });

    //edit an item
    $(document).on("click", ".editer", function(){
        var item = Number($(this).data("item"));
        getInfo(item, 1);
    });

    //transfer the item to somewhere else
    $(document).on("click", ".transfer", function(){
        var item = Number($(this).data("item"));
        getInfo(item, 2);
    });

    //copie an item and all there children
    $(document).on("click", ".copie", function(){
        var item = Number($(this).data("item"));
        getInfo(item, 3);
    });

    //delete an item
    $(document).on("click", ".delete", function(){
        var item = Number($(this).data("item"));
        getInfo(item, 0);
    });

    //list of sub item
    $(document).on("click", ".example", function(){
        $("#switch").html("Editor");
        example($(this).data("item"));
    });


    //-info screen options-

    //carry on with the command
    $(document).on("click", "#ok", function(){
        var item = Number($(this).data("item")),
        token = Number($(this).data("token")),
        close = true;
        switch(token){
            case 0:
            check.push(item);
            $("#item" + item).remove();
            list.splice(list.findIndex(x => x.item == item), 1);
            deletechildren();
            break;
            case 1:
            var place = list.findIndex(x => x.item == item),
            text = $("#temp").val();
            if(text.length > 0){
               list[place].text = text;
                fill(list[place].parent);
                if(opened.includes(item)){
                    $("#title" + item).html(text);
                } 
            } else {
                alert("please fill in some content for the item");
                close = false;
            }
            break;
            case 2:
            var temp = list.splice(list.findIndex(x => x.item == item), 1),
            oldParent = temp[0].parent,
            newParent = Number($("#temp").val());
            addItem({parent:newParent, item:temp[0].item, text:temp[0].text});
            fill(oldParent);
            if(opened.includes(newParent)){
                fill(newParent);
            }
            break;
            case 3:
            var temp = list.find(x => x.item == item),
            newItem = itemNumber(1),
            parent = Number($("#temp").val())
            check.push({oldItem:temp.item, newItem:newItem});
            addItem({parent:parent, item:newItem, text:temp.text});
            copiechildren();
            if(opened.includes(parent) || parent == 0){
                fill(parent);
            }
        }
        if(close){
            $("#dark").remove();
        }
    });

    //cancel the command
    $(document).on("click", "#cancel", function(){
        $("#dark").remove();
    });



    //--functions--

    //-example templates-

    //build example
    function example(parent){
        $("main").html("<div id='example'>" + getList(parent) + "</div>");
    }

    //build html list
    function getList(parent){
        var content = "",
        temp = list.filter(x => x.parent == parent);
        if(temp.length > 0){
            content += "<ol>";
            temp.forEach(function(item){
                content += "<li>" + item.text + "</li>" +
                getList(item.item);
            });
            content += "</ol>";
        }
        return content;
    }


    //-editor templates-

    //build editor
    function editor(){
        $("main").html("<div id='editor'></div>");
        opener(0, "New list");
    }

    //build a box
    function opener(parent, title){
        $("#editor").append("<div id='box" + parent +"' class='box'></div>");
        var content = "";
        if(parent > 0){
            content += "<button class='close' data-parent='" + parent + "'>X</button>";
        }
        content += "<div id='title" + parent + "' class='title'>" + title + "</div>" +
        "<div><textarea id='text" + parent + "' class='text'></textarea><br>" +
        "<button class='add' data-parent='" + parent + "'>Add</button></div>" +
        "<div id='content" + parent + "' class='content'></div>";
        $("#box" + parent).html(content);
        fill(parent);
    }

    //fill a box
    function fill(parent){
        var temp = list.filter(x => x.parent == parent);
        if(temp.length > 0){
            var content = "";
            temp.forEach(function(item){
                content += "<div class='item' id='item" + item.item + "'>" + item.text + 
                "<div class='menu'><div class='menu-button'>...</div><div class='menu-content'>" +
                "<div class='open' id='open" + item.item + "' data-item='" + item.item + "'>Open</div>" +
                "<div class='up' id='up" + item.item + "' data-item='" + item.item + "'>Move up</div>" +
                "<div class='down' id='down" + item.item + "' data-item='" + item.item + "'>Move down</div>" +
                "<div class='editer' data-item='" + item.item + "'>Edit</div>" +
                "<div class='transfer' data-item='" + item.item + "'>Transfer</div>" +
                "<div class='copie' data-item='" + item.item + "'>Copie</div>" +
                "<div class='delete' data-item='" + item.item + "'>Delete</div>" +
                "<div class='example' data-item='" + item.item + "'>Example</div></div></div></div>";
                check.push(item.item);
            });
            $("#content" + parent).html(content);
            disable("#up" + temp[0].item);
            disable("#down" + temp[temp.length - 1].item);
            checkIfOpen();
        }
    }


    //-info screen template-

    //get info screen for some actions
    function getInfo(item, token){
        $("body").append("<div id='dark'><div id='mid'><div id='info'></div></div></div>");
        switch(token){
            case 0:
            $("#info").html("<p>Are you sure you want to delete this item and all its children?</p>");
            break;
            case 1:
            $("#info").html("<p>Here you can edit your item</p><textarea id='temp'>" + list.find(x => x.item == item).text + "</textarea><br>");
            break;
            case 2:
            var content = getSelectContent(0, item, 1, false);
            if(content.length == 0){
                $("#info").html("<p>you can't transfer this item at the moment</p>");
                token = 404;
            } else {
                $("#info").html("<p>Select where you want to transfer the item and all its children to</p><select id='temp'>" + content + "</select>");
            }
            break;
            case 3:
            $("#info").html("<p>Select where you want to copie the item and all its children to</p><select id='temp'>" + getSelectContent(0, item, 1, true) + "</select>");
            break;
            case 4:
            $("#info").html("<p>please fill in some content for the item</p>")
        }
        $("#info").append("<button id='cancel'>Cancel</button><button id='ok' data-item='" + item + "' data-token='" + token + "'>Ok</button>");
    }

    //get the content for the selection
    function getSelectContent(parent, item, r, copie){
        var temp = list.filter(x => x.parent == parent),
        content = "";
        if(temp.length > 0){
            if(parent == 0 && (temp.findIndex(x => x.item == item) == -1 || copie)){
                content += "<option value='0'>root</option>";
            }
            temp.forEach(function(x){
                if(x.item != item){
                    if(x.item != list.find(i => i.item == item).parent || copie){
                        content += "<option value='" + x.item + "'>";
                        for(i = 0; i < r; i++){
                            content += "-";
                        }
                        content += x.text + "</option>";
                    }
                    content += getSelectContent(x.item, item, r + 1, copie);
                }
            });
        }
        return content;
    }


    //-misc-

    //add an item in the list
    function addItem(item){
        addSpace = list.findIndex(x => x.parent > item.parent);
        if(addSpace == -1){
            addSpace = list.length;
        }
        list.splice(addSpace, 0, item);
    }

    //find the first free item number (from a starting point)
    function itemNumber(i){
        for(;;i++){
            if(list.findIndex(x => x.item == i) == -1){
                return i;
            }
        }
    }

    //check if item(s) is/are open
    function checkIfOpen(){
        while(check.length > 0){
            if(opened.includes(check[0])){
                disable("#open" + check[0]);
            }
            check.shift();
        }
    }

    //disable an event
    function disable(item){
        $(item).prop("disabled", true);
        $(item).addClass("disabled");
    }

    //move item in the list
    function move(item, add){
        var start = list.findIndex(x => x.item == item),
        temp = list.splice(start, 1);
        list.splice(start + add, 0, temp[0]);
        fill(temp[0].parent);
    }

    //copie child(ren) of copied item(s)
    function copiechildren(){
        var newItem = 0;
        while(check.length > 0){
            var temp = list.filter(x => x.parent == check[0].oldItem);
            if(temp.length > 0){
                var temp2 = [];
                temp.forEach(function(item){
                    newItem = itemNumber(newItem + 1);
                    temp2.push({parent:check[0].newItem, item:newItem, text:item.text});
                    check.push({oldItem:item.item, newItem:newItem});
                });
                temp2.forEach(function(item){
                    addItem(item);
                });
            }
            check.shift();
        }
    }

    //delete child(ren) from deleted item(s) and delete boxes from html if necessary
    function deletechildren(){
        while(check.length > 0){
            var start = list.findIndex(x => x.parent == check[0]),
            close = opened.indexOf(check[0]);
            if(close > -1){
                $("#box" + check[0]).remove();
                opened.splice(close, 1);
            }
            if(start > -1){
                var temp = list.filter(x => x.parent == check[0]);
                temp.forEach(function(item){
                    check.push(item.item);
                });
                list.splice(start, temp.length);
            }
            check.shift();
        }
    }
});