var demos = [{"name": "Velocity addition", 
              "steps": [{"caption": "Three stars. The left and right stars approach the center star at high speed - 0.9 times the speed of light.",
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Center", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-30, -20, 0], "p": [2.1 * c, 0], "m": 1, "label": "Left", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [30, -30, 0], "p": [-2.1 * c, 0], "m": 1, "label": "Right", "shape": aSphere(5,64)}],
                         "frame": 0},
                        {"caption": "Let's see that again, but this time from the perspective of the far-left star. The rightmost star only approaches at 0.995c &mdash; not the 1.8c you'd expect.",
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Center", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-30, -20, 0], "p": [2.1 * c, 0], "m": 1, "label": "Left", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [30, -30, 0], "p": [-2.1 * c, 0], "m": 1, "label": "Right", "shape": aSphere(5,64)}],
                         "frame": 1}
                       ]
             },
             {"name": "Relativistic Doppler shift",
              "steps": [{"caption": "First watch as Doppler shifting is turned off. A star shoots past.",
                         "options": {"showDoppler": false, "showGamma": false},
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Observer", "options": {"showVelocity": false}, "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-30, -30, 0], "p": [1.5 * c, 0], "m": 1, "label": "Star", "shape": aSphere(5,64)}
                                    ],
                         "frame": 0},
                        {"caption": "Now watch the same motion with the relativistic Doppler effect visible.",
                         "options": {"showDoppler": true},
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Observer", "shape": aSphere(5,64), "options": {"showVelocity": false}},
                                     {"object": extendedObject, "x": [-30, -30, 0], "p": [1.5 * c, 0], "m": 1, "label": "Star", "shape": aSphere(5,64)}
                                    ],
                         "frame": 0}
                       ]
             },
             {"name": "Relativistic snake",
              "steps": [{"caption": "We have here two knives a fixed distance apart, moving downwards. A special breed of high-speed snake, <em>Crotalus relativisticus</em>, is moving at a speed close to the speed of light. It's just short enough to fit between the blades.",
                         "objects": [{"object": extendedObject, "x": [-27, -60, 0], "p": [0, 4, 0], "m": 1, "shape": [[5, -10, 0, 0], [5, 10, 0, 0], [-5, -10, 0, 0], [5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, -60, 0], "p": [0, 4, 0], "m": 1, "shape": [[-5, -10, 0, 0], [-5, 10, 0, 0], [5, -10, 0, 0], [-5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [-68, 0, 0], "p": [8, 0, 0], "m": 1, "shape": linesPadder([[-35, 0, 0, 0], [35, 0, 0, 0]],3)}
                                    ],
                         "options": {"showFramePos": true, "showVisualPos": false, "showVelocity": true}},
                        {"caption": "But then consider the perspective of the snake. It's not length-contracted &mdash; the knives are. They're much closer together. How does the snake survive the knives?",
                         "objects": [{"object": extendedObject, "x": [-27, -60, 0], "p": [0, 4, 0], "m": 1, "shape": [[5, -10, 0, 0], [5, 10, 0, 0], [-5, -10, 0, 0], [5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, -60, 0], "p": [0, 4, 0], "m": 1, "shape": [[-5, -10, 0, 0], [-5, 10, 0, 0], [5, -10, 0, 0], [-5, -10, 0, 0]]},
                                     {"object": extendedObject, "x": [-68, 0, 0], "p": [8, 0, 0], "m": 1, "shape": [[-35, 0, 0, 0], [35, 0, 0, 0]]}
                                    ],
                         "frame"  : 2,
                         "options": {"showFramePos": true, "showVisualPos": false}},
                       ]
             },
            {"name": "Test thingies.",
             "steps": [{"caption": "Test for a sphere",
                        "objects": [{"object": extendedObject, "x": [0, -32, 0], "p": [0,0,0], "m": 1, "shape": aSphere(10,100)},
                                    {"object": extendedObject, "x": [20, -20, -20], "p": [0,0,0], "m": 1, 
                                            "options": {"temperature": 3000}, 
                                            "label": "A circle",   "shape": aCircle(10,30)}
                      ],
             "options": {"showFramePos": true, "showVisualPos": true}}]},
            {"name": "Speed of light",
             "steps": [{"caption": "Two photons are emitted from the center of a ruler, heading outwards.",
                        "objects": [{"object": photon, "x": [0, 10, 0], "v": [1, 0, 0]},
                                    {"object": photon, "x": [0, 10, 0], "v": [-1, 0, 0]},
                                    {"object": extendedObject, "x": [0, 9, 0], "p": [5, 0, 0], "m": 1, "shape": aSphere(3, 20)},
                                    {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": linesPadder([[-100, 0, 0, 0], [100, 0, 0, 0]], 3)}
                                    ],
                        "options": {"showFramePos": true, "showVisualPos": false}},
                       {"caption": "Now, the same scene, from the perspective of an observe travelling past at a high speed.",
                        "objects": [{"object": photon, "x": [0, 10, 0], "v": [1, 0, 0]},
                                    {"object": photon, "x": [0, 10, 0], "v": [-1, 0, 0]},
                                    {"object": extendedObject, "x": [0, 9, 0], "p": [5, 0, 0], "m": 1, "shape": aSphere(3, 20)},
                                    {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": linesPadder([[-100, 0, 0, 0], [100, 0, 0, 0]], 3)},
                                    {"object": extendedObject, "x": [0, 0, 0], "p": [1, 0, 0], "m": 1, "shape": aSphere(5, 50)}],
                        "frame": 4,
                        "options": {"showFramePos": true, "showVisualPos": false}}
                      ]
            }
            ];
