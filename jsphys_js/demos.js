var threeObjects = {"steps": [{"caption": "Three stars. The top and left stars will move towards the center star.",
                               "objects": [{"object": mainSequenceStar, "x": [0, 0], "p": [0,0], "m": 1, "label": "Center"},
                                           {"object": mainSequenceStar, "x": [10, -20], "p": [0, 1], "m": 1, "label": "Top"},
                                           {"object": mainSequenceStar, "x": [-20, 10], "p": [1, 0], "m": 1, "label": "Left"}],
                               "frame": 0},
                              {"caption": "Let's see that again, but this time from the perspective of the top star.",
                               "objects": [{"object": mainSequenceStar, "x": [0, 0], "p": [0,0], "m": 1, "label": "Center"},
                                           {"object": mainSequenceStar, "x": [10, -20], "p": [0, 1], "m": 1, "label": "Top"},
                                           {"object": mainSequenceStar, "x": [-20, 10], "p": [1, 0], "m": 1, "label": "Left"}],
                               "frame": 1}
                             ]
                   };

var headOnObjects = {"steps": [{"caption": "Three stars. The left and right stars approach the center star at high speed.",
                               "objects": [{"object": mainSequenceStar, "x": [0, 0], "p": [0,0], "m": 1, "label": "Center"},
                                           {"object": mainSequenceStar, "x": [-20, 10], "p": [1, 0], "m": 1, "label": "Left"},
                                           {"object": mainSequenceStar, "x": [20, 10], "p": [-1, 0], "m": 1, "label": "Right"}],
                               "frame": 0},
                              {"caption": "Let's see that again, but this time from the perspective of the far-left star. Notice how different it appears.",
                               "objects": [{"object": mainSequenceStar, "x": [0, 0], "p": [0,0], "m": 1, "label": "Center"},
                                           {"object": mainSequenceStar, "x": [-20, 10], "p": [1, 0], "m": 1, "label": "Left"},
                                           {"object": mainSequenceStar, "x": [20, 10], "p": [-1, 0], "m": 1, "label": "Right"}],
                               "frame": 1}
                             ]
                    };