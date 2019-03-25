//GNU General Public License v3.0
$(document).ready(function(){
    //--var list--
    
    var list        = [],           //the list of items
        check       = [],           //things to be checked
        opened      = [],           //keep track of which items are opened
        listTitle   = "New list",   //title of the list
        saveSystem;                 //check if localsave is available



    //--autoplay--

    if(storageAvailable('localStorage')){
        saveSystem = true;
    } else {
        saveSystem = false;
    }
    if(saveSystem){
        $("header").html("<button id='switch'>Example</button>" +
        "<button id='saveList'>Save</button>" +
        "<button id='loadList'>Load</button>" +
        "<button id='deleteList'>Delete a save</button>" +
        "<button id='newList'>New list</button>" +
        "<button id='deleteStorage'>Clear saves</button>");
    } else {
        $("header").html("<button id='switch'>Example</button>");
    }
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
            reopen();
        }
    });

    //save current list
    $(document).on("click", "#saveList", function(){
        if(list.length > 0){
            getInfo(0, 5);
        } else {
            alert("There is nothing to save at the moment");
        }
    });

    //load a list
    $(document).on("click", "#loadList", function(){
        if(localStorage.length > 0){
            getInfo(0, 6);
        } else {
            alert("There are no saves in your local storage");
        }
    });

    //delete a save
    $(document).on("click", "#deleteList", function(){
        if(localStorage.length > 0){
            getInfo(0, 4);
        } else {
            alert("There are no saves in your local storage");
        }
    });

    //get a clean list
    $(document).on("click", "#newList", function(){
        if(list.length > 0){
            getInfo(0, 7);
        } else {
            alert("you already have a clean list");
        }
    });

    //empty the complete storage
    $(document).on("click", "#deleteStorage", function(){
        if(localStorage.length > 0){
            getInfo(0, 8);
        } else {
            alert("There are no saves in your local storage");
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
            addItem([{parent:parent, item:itemNumber(1), text:content}]);
            $("#text" + parent).val("");
            fill(parent);
        } else {
            alert("Please fill in some content for the item");
        }
    });

    //import a save
    $(document).on("click", ".importList", function(){
        var parent = Number($(this).data("parent"));
        if(localStorage.length > 0){
            getInfo(parent, 9);
        } else {
            alert("There are no saves in your local storage");
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

    //copy an item and all there children
    $(document).on("click", ".copy", function(){
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
            //delete item
            case 0:
            check.push(item);
            $("#item" + item).remove();
            list.splice(list.findIndex(x => x.item == item), 1);
            deletechildren();
            break;
            //edit item
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
                alert("Please fill in some content for the item");
                close = false;
            }
            break;
            //transfer item
            case 2:
            var temp = list.splice(list.findIndex(x => x.item == item), 1),
            oldParent = temp[0].parent,
            newParent = Number($("#temp").val());
            addItem([{parent:newParent, item:temp[0].item, text:temp[0].text}]);
            fill(oldParent);
            if(opened.includes(newParent)){
                fill(newParent);
            }
            break;
            //copy item
            case 3:
            var temp = list.find(x => x.item == item),
            newItem = itemNumber(1),
            parent = Number($("#temp").val())
            check.push({oldItem:temp.item, newItem:newItem});
            addItem({parent:parent, item:newItem, text:temp.text});
            copychildren();
            if(opened.includes(parent) || parent == 0){
                fill(parent);
            }
            break;
            //remove save
            case 4:
            localStorage.removeItem(localStorage.key(Number($("#nameList").val())));
            break;
            //save list
            case 5:
            var savePlace = Number($("#nameList").val());
            if(savePlace == -1){
                var text = $("#saveName").val();
                if(text.length > 0){
                    if(localStorage.getItem(text) === null){
                        saveList(text, JSON.stringify(list));
                    } else {
                        alert("This save name is already taken");
                        close = false;
                    }
                } else {
                    alert("Please fill in a name for the save or choose a save that is already there");
                    close = false;
                }
            } else {
                saveList(localStorage.key(savePlace), JSON.stringify(list));
            }
            break;
            //load save
            case 6:
            var savePlace = Number($("#nameList").val());
            if(localStorage.key(savePlace) != listTitle){
                listTitle = localStorage.key(savePlace);
                list = JSON.parse(localStorage.getItem(listTitle));
                opened.splice(0, opened.length);
                editor();
            } else {
                alert("this safe is already loaded");
                close = false;
            }
            break;
            //delete save
            case 7:
            list.splice(0, list.length);
            opened.splice(0, opened.length);
            listTitle = "New list";
            editor();
            break;
            //empty the complete storage
            case 8:
            localStorage.clear();
            break;
            //import a list
            case 9:
            importList(item, localStorage.key($("#nameList").val()));
        }
        if(close){
            $("#dark").remove();
        }
    });

    //cancel the command
    $(document).on("click", "#cancel", function(){
        $("#dark").remove();
    });

    //check if they want to save a new list or not
    $(document).on("change", "#nameList", function(){
        if(Number($("#nameList").val()) == -1){
            $("#info1").append("<div id='info3'><p>Choose save name</p><input type='text' id='saveName'></div>");
        } else if($("#info3").length > 0){
            $("#info3").remove();
        }
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
        opener(0, listTitle);
    }

    //build a box
    function opener(parent, title){
        $("#editor").append("<div id='box" + parent +"' class='box'></div>");
        var content = "";
        if(parent > 0){
            content += "<button class='close' data-parent='" + parent + "'>X</button>";
        }
        content += "<div id='title" + parent + "' class='title'>" + title + "</div>" +
        "<div><textarea id='text" + parent + "' class='text'></textarea><br>";
        if(saveSystem){
            content += "<button class='add' data-parent='" + parent + "'>Add</button>" +
            "<button class='importList' data-parent'" + parent + "'>Import</button></div>";
        } else {
            content += "<button class='add' data-parent='" + parent + "'>Add</button>";
        }
        content += "<div id='content" + parent + "' class='content'></div>";
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
                "<div class='copy' data-item='" + item.item + "'>Copy</div>" +
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
        $("body").append("<div id='dark'><div id='mid'><div id='info'><div id='info1'></div><div id='info2'></div></div></div></div>");
        switch(token){
            //delete item
            case 0:
            $("#info1").html("<p>Are you sure you want to delete this item and all its children?</p>");
            break;
            //edit item
            case 1:
            $("#info1").html("<p>Here you can edit your item</p>" +
            "<textarea id='temp'>" + list.find(x => x.item == item).text + "</textarea>");
            break;
            //transfer item
            case 2:
            var content = getSelectContent(0, item, 1, false);
            if(content.length == 0){
                $("#info1").html("<p>You can't transfer this item at the moment</p>");
                token = 404;
            } else {
                $("#info1").html("<p>Select where you want to transfer the item and all its children too</p>" +
                "<select id='temp'>" + content + "</select>");
            }
            break;
            //copy item
            case 3:
            $("#info1").html("<p>Select where you want to copy the item and all its children too</p>" +
            "<select id='temp'>" + getSelectContent(0, item, 1, true) + "</select>");
            break;
            //delete save
            case 4:
            $("#info1").html("<p>please select the save you want to delete</p>" +
            "<p><b>WARNING:</b> this can't be undone!</p>" +
            "<select id='nameList'>" + getSaveList(false) + "</select>");
            break;
            //save list
            case 5:
            $("#info1").html("<p>Please select how you want to save this list</p>" +
            "<select id='nameList'>" + getSaveList(true) + "</select>" +
            "<div id='info3'><p>Choose save name</p><input type='text' id='saveName'></div>");
            break;
            //load save
            case 6:
            $("#info1").html("<p>Please select te save you want to load</p>" +
            "<select id='nameList'>" + getSaveList(false) + "</select>");
            break;
            //clear list
            case 7:
            $("#info1").html("<p>Do you realy want a clean list?</p>" +
            "<p><b>WARNING:</b> any unsaved process gets lost when you do!</p>");
            break;
            //empty the complete storage
            case 8:
            $("#info1").html("<p>do you realy want to delete all saves?</p>" +
            "<p><b>WARNING:</b> this can't be undone!</p>");
            break;
            //import a save
            case 9:
            $("#info1").html("<p>Please select the save you want to import</p>" +
            "<select id='nameList'>" + getSaveList(false) + "</select>");
        }
        $("#info2").html("<button id='cancel'>Cancel</button><button id='ok' data-item='" + item + "' data-token='" + token + "'>Ok</button>");
    }

    //get the content for the selection
    function getSelectContent(parent, item, r, copy){
        var temp = list.filter(x => x.parent == parent),
        content = "";
        if(temp.length > 0){
            if(parent == 0 && (temp.findIndex(x => x.item == item) == -1 || copy)){
                content += "<option value='0'>root</option>";
            }
            temp.forEach(function(x){
                if(x.item != item){
                    if(x.item != list.find(i => i.item == item).parent || copy){
                        content += "<option value='" + x.item + "'>";
                        for(i = 0; i < r; i++){
                            content += "-";
                        }
                        content += x.text + "</option>";
                    }
                    content += getSelectContent(x.item, item, r + 1, copy);
                }
            });
        }
        return content;
    }

    //build save list
    function getSaveList(s){
        var content;
        if(s){
            content += "<option value='-1'>New save</option>";
        }
        for(i = 0; localStorage.length > i; i++){
            content += "<option value='" + i + "'>" + localStorage.key(i) + "</option>";
        }
        return content;
    }


    //-misc-

    //reopen all items after some actions
    function reopen(){
        opened.forEach(function(item){
            opener(item, list.find(x => x.item == item).text);
        });
    }

    //add an item in the list
    function addItem(temp){
        addSpace = list.findIndex(x => x.parent > temp[0].parent);
        if(addSpace == -1){
            temp.forEach(function(item){
                list.push(item);
            });
        } else {
            temp.forEach(function(item, i){
                list.splice(addSpace + i, 0 ,item);
            });
        }
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

    //copies child(ren) of copied item(s)
    function copychildren(){
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
                addItem(temp2);
            }
            check.shift();
        }
    }

    //import a list
    function importList(parent, savePlace){
        var temp = localStorage.getItem(savePlace),
        newItem = itemNumber(1);
        check.push({oldItem:0, newItem:parent});
        addItem([{parent:parent, item:newItem, text:savePlace}]);
        while(check.length > 0){
            var temp2 = temp.filter(x => x.parent == check[0].oldItem);
            if(temp2.length > 0){
                var temp3 = [];
                temp2.forEach(function(item){
                    newItem = itemNumber(newItem + 1);
                    temp3.push({parent:check[0].newItem, item:newItem, text:item.text});
                    check.push({oldItem:item.item, newItem:newItem});
                });
                addItem(temp3);
            }
            check.shift();
        }
        fill(parent);
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


    //-local storage fuctions-

    // check if storage is available
    function storageAvailable(type) {
        try {
            var storage = window[type],
            x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && ( e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && storage.length !== 0;
        }
    }
    
    //save the list
    function saveList(text, jsonList){
        localStorage.setItem(text, jsonList);
        listTitle = text;
        editor();
        reopen();
    }
});