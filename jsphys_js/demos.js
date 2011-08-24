var demos = [{"name": "Velocity addition", 
              "steps": [{"caption": "Three stars. The left and right stars approach the center star at high speed - 0.9 times the speed of light.",
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Center"},
                                     {"object": mainSequenceStar, "x": [-30, 10, 0], "p": [2.1 * c, 0], "m": 1, "label": "Left"},
                                     {"object": mainSequenceStar, "x": [30, 20, 0], "p": [-2.1 * c, 0], "m": 1, "label": "Right"}],
                         "frame": 0},
                        {"caption": "Let's see that again, but this time from the perspective of the far-left star. The rightmost star only approaches at 0.995c &mdash; not the 1.8c you'd expect.",
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Center"},
                                     {"object": mainSequenceStar, "x": [-30, 10, 0], "p": [2.1 * c, 0], "m": 1, "label": "Left"},
                                     {"object": mainSequenceStar, "x": [30, 20, 0], "p": [-2.1 * c, 0], "m": 1, "label": "Right"}],
                         "frame": 1}
                       ]
             },
             {"name": "Relativistic Doppler shift",
              "steps": [{"caption": "First watch as Doppler shifting is turned off. A star shoots past.",
                         "options": {"showDoppler": false, "showGamma": false},
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Observer", "options": {"showVelocities": false}},
                                     {"object": mainSequenceStar, "x": [-30, -20, 0], "p": [1.5 * c, 0], "m": 1, "label": "Star"}
                                    ],
                         "frame": 0},
                        {"caption": "Now watch the same motion with the relativistic Doppler effect visible.",
                         "options": {"showDoppler": true},
                         "objects": [{"object": mainSequenceStar, "x": [0, 0, 0], "p": [0, 0], "m": 1, "label": "Observer", "options": {"showVelocities": false}},
                                     {"object": mainSequenceStar, "x": [-30, -20, 0], "p": [1.5 * c, 0], "m": 1, "label": "Star"}
                                    ],
                         "frame": 0}
                       ]
             },
             {"name": "Relativistic snake",
              "steps": [{"caption": "We have here two knives a fixed distance apart, moving downwards. A special breed of high-speed snake, <em>Crotalus relativisticus</em>, is moving at a speed close to the speed of light. It's just short enough to fit between the blades.",
                         "objects": [{"object": extendedObject, "x": [-27, -60, 0], "p": [0, 2, 0], "m": 1, "shape": [[5, -10, 0, 0], [5, 10, 0, 0], [-5, -10, 0, 0], [5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, -60, 0], "p": [0, 2, 0], "m": 1, "shape": [[-5, -10, 0, 0], [-5, 10, 0, 0], [5, -10, 0, 0], [-5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [-60, 0, 0], "p": [2, 0, 0], "m": 1, "shape": [[-37, 0, 0, 0], [37, 0, 0, 0]]}
                                    ],
                         "options": {"showFramePos": true, "showVisualPos": false}},
                        {"caption": "But then consider the perspective of the snake. It's not length-contracted &mdash; the knives are. They're much closer together. How does the snake survive the knives?",
                         "objects": [{"object": extendedObject, "x": [-27, -60, 0], "p": [0, 2, 0], "m": 1, "shape": [[5, -10, 0, 0], [5, 10, 0, 0], [-5, -10, 0, 0], [5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, -60, 0], "p": [0, 2, 0], "m": 1, "shape": [[-5, -10, 0, 0], [-5, 10, 0, 0], [5, -10, 0, 0], [-5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [-60, 0, 0], "p": [2, 0, 0], "m": 1, "shape": [[-37, 0, 0, 0], [37, 0, 0, 0]]}
                                    ],
                         "frame"  : 2,
                         "options": {"showFramePos": true, "showVisualPos": true}},
                       ]
             }
            ];
