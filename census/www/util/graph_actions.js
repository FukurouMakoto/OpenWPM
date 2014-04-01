var curr_clicked = null;  // currently clicked node
var curr_cookies = null;  // list of cookies held at currently clicked node
var highlighted = "ffff00";  // color to highlight node
var faded = "fffaf0"; // color for faded out nodes

// dummy function: colors a node gray
function hover_node(n) {
    // either we are not clicking on a node or we are hovering over that node
    // also, ignore nodes that are not currently highlighed
    if (curr_clicked == null || n.data.node.id == curr_clicked || n.data.node.color != highlighted) {
        return;
    }

    // try to find the common cookies
    common_cookies = [];
    curr_cookies.forEach(function (c) {
        if (c in n.data.node.cookies) {
            common_cookies.push(c);
        }
    });
    
    common_cookies.sort();
    console.log(common_cookies);
    fill_cookie_data(n.data.node.id);
    
    s.refresh();
}

function unhover_node(n) {
    if (curr_clicked == null) {
        return;
    }

    fill_cookie_data(null);
}

function click_stage(stage) {
    reset_settings(stage);
    s.refresh();
}

// sets the graph to its original coloring
function reset_settings(stage) {
    s.graph.nodes().forEach(function(n) {
        n.color = n.original_color;
    });
    s.graph.edges().forEach(function(e) {
        e.color = e.original_color;
    });
}

function click_node(e) {
    if (e.data.node.id == curr_clicked) {
        return;
    }
    color_flow(e);
    fill_cookie_data(null);
}

// used for clicking, colors all nodes and edges that share a common cookie
// with the currently clicked node
function color_flow(e) {
    // gets the cookies placed at this node
    cookies = Object.keys(e.data.node.cookies);
    curr_clicked = e.data.node.id;
    curr_cookies = cookies;

    // color all nodes that have a cookie shared with this node
    s.graph.nodes().forEach(function(n) {
        cookies.some(function(c) {
            if (c in n.cookies) {
                n.color = highlighted;
            }
            else {
                n.color = faded;
            }
        });
    });

    // next, color the edges
    s.graph.edges().forEach(function(e) {
        cookies.some(function(c) {
            if (c in e.cookies) {
                e.color = highlighted;
            }
            else {
                e.color = faded;
            }
        });
    });
    s.refresh();
}

function fill_cookie_data(hovered_node) {
    if (hovered_node == null) {
        $("#owners").html(s.graph.nodes(curr_clicked).label);
        // in this case, we fill in all of the current cookies
        owned_cookies = "";
        curr_cookies.forEach(function(c) {
            owned_cookies += c + "</br>";
        });
        $("#cookies").html(owned_cookies);
    }

    else {
        console.log(s.graph.nodes(hovered_node).label);
        $("#owners").html(s.graph.nodes(curr_clicked).label + " and " + s.graph.nodes(hovered_node).label);
        owned_cookies = "";
        curr_cookies.forEach(function(c) {
            if (c in s.graph.nodes(hovered_node).cookies) {
                owned_cookies += c + "</br>";
            }
        });
        $("#cookies").html(owned_cookies);
    }
}