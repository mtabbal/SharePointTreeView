'use strict';

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var ExceptLiarray = ['Site Assets', 'Style Library', 'Form Templates'];
// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {
    $('#DocTree').jstree({
        "core": {
            'check_callback': true,
        }
    });
    $("#DocTree").bind('select_node.jstree', function (e,data) {
        var value = $("#DocTree").jstree("get_selected");
        FetchSubFolder(data.node.data.RURL, value);
        FetchFiles(data.node.data.RURL, value);
    });
    InitialCall();
});
function InitialCall() {
    FetchAllLibrary().promise().then(
            function (Libdata) {
                $.each(Libdata.d.results, function (key, value) {
                    if (ExceptLiarray.indexOf(value.Title) == -1) {
                        FetchLibRelativeURL(value.RootFolder.__deferred.uri).promise().then(
                            function (data) {
                                AddNoteToTree(null,data.d.Name, encodeURI(data.d.ServerRelativeUrl),'fi-folder');
                            },
                            function (err) {
                            }
                        );
                    }
                });
            },
            function (err) {
            }
            );
}
function FetchAllLibrary() {
    var deferred = $.Deferred();
    $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + '/_api/web/lists?$filter=BaseTemplate  eq 101',
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        success: function (data) {
            deferred.resolve(data);
        },
        error: function (data2) {
            self.error("Error in processing request " + data2.success);
        }
    });
    return deferred;
}
function FetchLibRelativeURL(URL) {
    var deferred = $.Deferred();
    $.ajax({
        url: URL,
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        success: function (data) {
            deferred.resolve(data);
        },
        error: function (data2) {
        }
    });
    return deferred;
}
function FetchSubFolder(ServerRelativeURL,ParentNode) {
    $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + ServerRelativeURL + "')/Folders",
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            $.each(data.d.results, function (key, value) {
                if (value.Name != 'Forms') {
                    AddNoteToTree(ParentNode, value.Name, value.ServerRelativeUrl,'fi-folder');
                }
            });
        },
        error: function (data2) {
        }
    });
}
function FetchFiles(ServerRelativeURL, ParentNode) {
    $.ajax({
        url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + ServerRelativeURL + "')/Files",
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            $.each(data.d.results, function (key, value) {
                var FileLink = '<a href="' + value.ServerRelativeUrl + '">' + value.Name + '</a>';
                AddNoteToTree(ParentNode, FileLink, value.ServerRelativeUrl, 'fi-page');
            });
        },
        error: function (data2) {
        }
    });
}
function AddNoteToTree(ParentNode, NodeName, RelativeURL,IconName) {
    var id = $("#DocTree").jstree('create_node', ParentNode,
        {
            "data": { "RURL": RelativeURL },
            "text": NodeName,
            "icon": IconName,
            'children': false,
        },
'last');
}




