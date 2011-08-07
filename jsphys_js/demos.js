var demos = [{"name": "Velocity addition", 
              "steps": [{"caption": "Three stars. The left and right stars approach the center star at high speed - 0.9 times the speed of light.",
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Center"},
                                     {"object": mainSequenceStar, "x": [-30, 10, 0], "p": [2.1, 0], "m": 1, "label": "Left"},
                                     {"object": mainSequenceStar, "x": [30, 20, 0], "p": [-2.1, 0], "m": 1, "label": "Right"}],
                         "frame": 0},
                        {"caption": "Let's see that again, but this time from the perspective of the far-left star. The rightmost star only approaches at 0.995c &mdash; not the 1.8c you'd expect.",
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Center"},
                                     {"object": mainSequenceStar, "x": [-30, 10, 0], "p": [2.1, 0], "m": 1, "label": "Left"},
                                     {"object": mainSequenceStar, "x": [30, 20, 0], "p": [-2.1, 0], "m": 1, "label": "Right"}],
                         "frame": 1}
                       ]
             },
             {"name": "Relativistic Doppler shift",
              "steps": [{"caption": "First watch as Doppler shifting is turned off. A star shoots past.",
                         "showDoppler": false,
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Observer"},
                                     {"object": mainSequenceStar, "x": [-30, -20, 0], "p": [1.5, 0], "m": 1, "label": "Star"}
                                    ],
                         "frame": 0},
                        {"caption": "Now watch the same motion with the relativistic Doppler effect visible.",
                         "showDoppler": true,
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Observer"},
                                     {"object": mainSequenceStar, "x": [-30, -20, 0], "p": [1.5, 0], "m": 1, "label": "Star"}
                                    ],
                         "frame": 0}
                       ]
             },
            ];
