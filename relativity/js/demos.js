var demos = [
    {
	"name": "Exam 1 Question 4",
	"steps": [
	    {
		"caption": "A train of length 100 m (as measured in its own rest frame) rushes past a platform at a speed of v = 0.8c. The train is equipped with two beacons, one on the front and one on the rear of the train, which each emit a flash of light as the front of the train reaches the end of the platform. Alice, who is seated right in the middle of the train, sees both flashes simultaneously. In the Minkowski diagram below, bright white lines represent the light flashes as they travel to Alice.",
		"objects": [{"object": extendedObject, "label": "Platform", "x": [0, 0, 0], "p": [-4, 0, 0], "m": 1, "shape": [[-30, 5, 0, 0], [-30, -15, 0, 0], [30, -15, 0, 0], [30, 5, 0, 0], [-30, 5, 0, 0]]},
			    {"object": extendedObject, "x": [-200, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[-40, 2, 0, 0], [-40, -2, 0, 0], [40, -2, 0, 0], [40, 2, 0, 0], [-40, 2, 0, 0]], "options": {"showVelocity": false}},
			    {"object": extendedObject, "label": "Back", "x": [-240, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [0, -2, 0, 0]]},
			    {"object": extendedObject, "label": "Front", "x": [-160, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [0, -2, 0, 0]]},
			    {"object": extendedObject, "label": "Alice", "x": [-200, 20, 0], "p": [0, 0, 0], "m": 1, "shape": aMan(3, 7)},
			    {"object": extendedObject, "x": [0, -5, 0], "p": [-4, 0, 0], "m": 1, "shape": aMan(3, 7), "options": {"showVelocity": false}},
			    {"object": photon, "x": [-160, 10, 0, 170], "v": [-1, 0, 0], "options": {"showCircle": true}},
			    {"object": photon, "x": [-240, 10, 0, 170], "v": [1, 0, 0], "options": {"showCircle": true}}
			    ],
		"options": {"showFramePos": true, "showVisualPos": false, "showGamma": false},
		"frame": 4
	    },
	    {
		"caption": "Now we view from Bob's perspective on the platform. According to Bob, the beacons do not flash simultaneously. In fact, the rear beacon must fire long before the train ever reaches the station.",
		"objects": [{"object": extendedObject, "x": [0, 0, 0], "p": [-4, 0, 0], "m": 1, "shape": [[-30, 5, 0, 0], [-30, -15, 0, 0], [30, -15, 0, 0], [30, 5, 0, 0], [-30, 5, 0, 0]]},
			    {"object": extendedObject, "x": [-200, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[-40, 2, 0, 0], [-40, -2, 0, 0], [40, -2, 0, 0], [40, 2, 0, 0], [-40, 2, 0, 0]], "options": {"showVelocity": false}},
			    {"object": extendedObject, "label": "Back", "x": [-240, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [0, -2, 0, 0]]},
			    {"object": extendedObject, "label": "Front", "x": [-160, 10, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [0, -2, 0, 0]]},
			    {"object": extendedObject, "label": "Alice", "x": [-200, 20, 0], "p": [0, 0, 0], "m": 1, "shape": aMan(3, 7)},
			    {"object": extendedObject, "label": "Bob", "x": [0, -5, 0], "p": [-4, 0, 0], "m": 1, "shape": aMan(3, 7), "options": {"showVelocity": false}},
			    {"object": photon, "x": [-160, 10, 0, 170], "v": [-1, 0, 0], "options": {"showCircle": true}},
			    {"object": photon, "x": [-240, 10, 0, 170], "v": [1, 0, 0], "options": {"showCircle": true}}
			    ],
		"options": {"showFramePos": true, "showVisualPos": false, "showGamma": false},
		"frame": 5
	    }
	    ]
    },
            {"name": "C is constant: Relativistic flashlight",
             "steps": [{"caption": "A flashlight emits a photon. It moves away at the speed of light. An observer moves past at a high speed. What will the observer see?",
                        "objects": [{"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [3, 4, 0, 0], [3, -4, 0, 0], [0, -2, 0, 0], [-5, -2, 0, 0], [-5, 2, 0, 0], [0, 2, 0, 0]]},
                                    {"object": photon, "x": [3, 0, 0], "v": [1, 0, 0]},
                                    {"object": extendedObject, "x": [50, -30, 0], "p": [-6, 0, 0], "m": 1, "shape": aSphere(3, 50), "label": "Observer"}
                                    ],
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false}},
                       {"caption": "From the observer's perspective, the photon travels exactly the speed of light &mdash; with the flashlight chasing it! Light moves at the same speed according to all observers.",
                        "objects": [{"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": [[0, 2, 0, 0], [3, 4, 0, 0], [3, -4, 0, 0], [0, -2, 0, 0], [-5, -2, 0, 0], [-5, 2, 0, 0], [0, 2, 0, 0]]},
                                    {"object": photon, "x": [3, 0, 0], "v": [1, 0, 0]},
                                    {"object": extendedObject, "x": [50, -30, 0], "p": [-6, 0, 0], "m": 1, "shape": aSphere(3, 50), "label": "Observer"}
                                    ],
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false},
                        "frame": 2,
                        "shift": [0, 0, 0, -70]}
                      ]
            },
            { "name" : "Simultaneity: Han and Greedo",
              "steps": [{"caption": "Han and Greedo are standing at a bar. They both shoot their laser guns, but miss each other due to hitting a pot-plant. Luke walks by at close to light speed as they do this.",
                         "objects": [{"object": extendedObject, "x": [-100, 0, 0], "p": [0,0,0], "m": 1,
                                            "label": "Greedo", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 100, 0, 0], "p": [0,0,0], "m": 1,
                                            "label": "Han", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 0, -30, 0], "p": [1,0,0], "m": 1,
                                            "label": "Luke", "shape": aMan(5,10)},

                                     {"object": extendedObject, "x": [0, 0, 0], "p": [0,0,0], "m": 1, "shape": potPlant(5,30)},
                                     {"object": photon, "x": [-90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [0, 0, 0, 0] }},
                                     {"object": photon, "x": [90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [0, 0, 0, 0] }}
                                    ],
                         "timeScale": 0.005,
                         "options": {"showVisualPos": false, "showFramePos": true},
                         "shift": [0,0,0,-10]
                        },
                        {"caption": "Let's look at the same scene again from Luke's point of view -- if we make a Galilean transform. Can you see something wrong?",
                         "objects": [{"object": extendedObject, "x": [-100, 0, 0], "p": [-1,0,0], "m": 1,
                                            "label": "Greedo", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 100, 0, 0], "p": [-1,0,0], "m": 1,
                                            "label": "Han", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 0, -30, 0], "p": [0,0,0], "m": 1,
                                            "label": "Luke", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [0, 0, 0], "p": [-1,0,0], "m": 1, "shape": potPlant(5,30)},
                                     {"object": photon, "x": [-90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [-22, 0, 0, 0] }},
                                     {"object": photon, "x": [90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [-40, 0, 0, 0] }}
                                    ],
                         "timeScale": 0.005,
                         "options": {"showVisualPos": false, "showFramePos": true},
                         "shift": [0,0,0,-10]
                        },
                        {"caption": "Let's try that again with a Lorentz transform. If the distance from Luke to Han is the same as the distance from Luke to Greedo, then the only conclusion is that Han shot first.",
                         "objects": [{"object": extendedObject, "x": [-100, 0, 0], "p": [0,0,0], "m": 1,
                                            "label": "Greedo", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 100, 0, 0], "p": [0,0,0], "m": 1,
                                            "label": "Han", "shape": aMan(5,10)},
                                     {"object": extendedObject, "x": [ 0, -30, 0], "p": [1,0,0], "m": 1,
                                            "label": "Luke", "shape": aMan(5,10)},

                                     {"object": extendedObject, "x": [0, 0, 0], "p": [0,0,0], "m": 1, "shape": potPlant(5,30)},
                                     {"object": photon, "x": [-90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [0, 0, 0, 0] }},
                                     {"object": photon, "x": [90, 0, 0], "v": [-1, 0, 0],
                                         "options": {"showCircle": false, "endPt": [0, 0, 0, 0] }}
                                    ],
                         "timeScale": 0.005,
                         "frame": 2,
                         "options": {"showVisualPos": false, "showFramePos": true},
                         "shift": [0,30,0,-50]
                        }

                        ]
             },
             {"name": "Simultaneity: Relativistic snake",
              "steps": [{"caption": "We have here two knives a fixed distance apart, moving upwards. A special breed of high-speed snake, <em>Crotalus relativisticus</em>, is moving at a speed close to the speed of light. It's just short enough to fit between the blades.",
                         "objects": [{"object": extendedObject, "x": [-27, 60, 0], "p": [0, -4, 0], "m": 1, "shape": [[5, 10, 0, 0], [5, -10, 0, 0], [0, 10, 0, 0], [5, 10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, 60, 0], "p": [0, -4, 0], "m": 1, "shape": [[-5, 10, 0, 0], [-5, -10, 0, 0], [0, 10, 0, 0], [-5, 10, 0, 0]]},
                                     {"object": extendedObject, "x": [-70, 0, 0], "p": [8, 0, 0], "m": 1, "shape": [[-38, 0, 0, 0], [38, 0, 0, 0]]}
                                    ],
                         "options": {"showFramePos": true, "showVisualPos": false, "showVelocity": true, "showGamma": false}},
                        {"caption": "But then consider the perspective of the snake. It's not length-contracted &mdash; the knives are. They're much closer together. How does the snake survive the knives?",
                         "objects": [{"object": extendedObject, "x": [-27, 60, 0], "p": [0, -4, 0], "m": 1, "shape": [[5, 10, 0, 0], [5, -10, 0, 0], [0, 10, 0, 0], [5, 10, 0, 0]]},
                                     {"object": extendedObject, "x": [27, 60, 0], "p": [0, -4, 0], "m": 1, "shape": [[-5, 10, 0, 0], [-5, -10, 0, 0], [0, 10, 0, 0], [-5, 10, 0, 0]]},
                                     {"object": extendedObject, "x": [-70, 0, 0], "p": [8, 0, 0], "m": 1, "shape": [[-38, 0, 0, 0], [38, 0, 0, 0]]}
                                    ],
                         "frame"  : 2,
                         "shift"    : [0,0,0,-100],
                         "options": {"showFramePos": true, "showVisualPos": false,"showVelocity": true, "showGamma": false}}
                       ]
            },
            {"name": "Simultaneity, c is constant: Ruler",
             "steps": [{"caption": "Two photons are emitted from the center of a ruler, heading outwards. Since they both travel at c, they reach the ends at the same time. But what happens from the perspective of the observer moving right?",
                        "objects": [{"object": photon, "x": [0, 10, 0], "v": [1, 0, 0]},
                                    {"object": photon, "x": [0, 10, 0], "v": [-1, 0, 0]},
                                    {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": linesPadder([[-100, 0, 0, 0], [100, 0, 0, 0]], 20)},
                                    {"object": extendedObject, "x": [0, -10, 0], "p": [5, 0, 0], "m": 1, "shape": aSphere(3, 50)}
                                    ],
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false}},
                       {"caption": "This is the same scene from the perspective of the observer travelling right at a high speed. Now the photons don't reach the ends of the ruler at the same time. The speed of light is the same according to every observer.",
                        "objects": [{"object": photon, "x": [0, 10, 0], "v": [1, 0, 0]},
                                    {"object": photon, "x": [0, 10, 0], "v": [-1, 0, 0]},
                                    {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0, 0], "m": 1, "shape": linesPadder([[-100, 0, 0, 0], [100, 0, 0, 0]], 20)},
                                    {"object": extendedObject, "x": [0, -10, 0], "p": [5, 0, 0], "m": 1, "shape": aSphere(3, 50)}],
                        "frame": 3,
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false}}
                      ]
            },
            {"name": "Time Dilation: Light Clock",
             "steps": [{"caption": "A clock consisting of two mirrors bouncing a photon ticks every x/c seconds, where x is the distance between the mirrors.",
                        "objects": [{"object": photon, "x": [-10,0,0,  0], "v": [0,0,0], "options": {"endPt": [ 10,0,0]}},
                                    {"object": photon, "x": [ 10,0,0, 20], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": photon, "x": [-10,0,0, 40], "v": [0,0,0], "options": {"endPt": [ 10,0,0,120]}},
                                    {"object": photon, "x": [ 10,0,0, 60], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": photon, "x": [-10,0,0, 80], "v": [0,0,0], "options": {"endPt": [ 10,0,0,120]}},
                                    {"object": photon, "x": [ 10,0,0,100], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": extendedObject, "x": [-10, 0, 0], "p": [0, 0, 0], "m": 1,
                                     "shape": linesPadder([[0, -5, 0, 0], [0, 5, 0, 0]], 5), "label": "Mirror"},
                                    {"object": extendedObject, "x": [10, 0, 0], "p": [0, 0, 0], "m": 1,
                                     "shape": linesPadder([[0, -5, 0, 0], [0, 5, 0, 0]], 5), "label": "Mirror"},
                                    {"object": extendedObject, "x": [40, -60, 0], "p": [0, 1.73, 0], "m": 1,
                                     "shape": aCircle(5, 20), "label": "Observer", "options": {"showVelocity": true}}
                                   ],
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false, "c": 1, "showVelocity": false},
                        "timeScale": 0.02
                        },
                        {"caption": "In the observer's frame, the light is travelling on the diagonal. It must travel further to hit the mirror, so the clock runs slower.",
                         "objects": [{"object": extendedObject, "x": [40, -60, 0], "p": [0, 1.73, 0], "m": 1,
                                     "shape": aCircle(5, 20), "label": "Observer", "options": {"showVelocity": true}},
                                    {"object": photon, "x": [-10,0,0,  0], "v": [0,0,0], "options": {"endPt": [ 10,0,0]}},
                                    {"object": photon, "x": [ 10,0,0, 20], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": photon, "x": [-10,0,0, 40], "v": [0,0,0], "options": {"endPt": [ 10,0,0,120]}},
                                    {"object": photon, "x": [ 10,0,0, 60], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": photon, "x": [-10,0,0, 80], "v": [0,0,0], "options": {"endPt": [ 10,0,0,120]}},
                                    {"object": photon, "x": [ 10,0,0,100], "v": [0,0,0], "options": {"endPt": [-10,0,0,120]}},
                                    {"object": extendedObject, "x": [-10, 0, 0], "p": [0, 0, 0], "m": 1,
                                     "shape": linesPadder([[0, -5, 0, 0], [0, 5, 0, 0]], 5), "label": "Mirror"},
                                    {"object": extendedObject, "x": [10, 0, 0], "p": [0, 0, 0], "m": 1,
                                     "shape": linesPadder([[0, -5, 0, 0], [0, 5, 0, 0]], 5), "label": "Mirror"}
                                   ],
                        "options": {"showFramePos": true, "showVisualPos": false, "showGamma": false, "c": 1, "showVelocity": false},
                        "timeScale": 0.02,
                        "frame": 0,
                        "shift": [-40,0,0,0]
                        }

                      ]
            },


            {"name": "Velocity addition",
             "steps": [{"caption": "Three stars. The left and right stars approach the center star at high speed - 0.9 times the speed of light. What would the star on the left see? Would it look like the star on the right is approaching at 1.8c?",
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Center", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-70, -20, 0], "p": [10.5, 0], "m": 1, "label": "Left", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [70, -30, 0], "p": [-10.5, 0], "m": 1, "label": "Right", "shape": aSphere(5,64)}],
                         "options": {"c": 5, "showGamma": false, "showFramePos": true, "showVisualPos": false},
                         "frame": 0},
                        {"caption": "From the left-most star's perspective, the rightmost star only approaches at 0.995c &mdash; not the 1.8c you'd expect.",
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Center", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-70, -20, 0], "p": [10.5, 0], "m": 1, "label": "Left", "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [70, -30, 0], "p": [-10.5, 0], "m": 1, "label": "Right", "shape": aSphere(5,64)}],
                         "options": {"c": 5, "showGamma": false, "showFramePos": true, "showVisualPos": false},
                         "frame": 1}
                       ]
            },
            {"name": "Relativistic Doppler shift",
              "steps": [{"caption": "First watch as Doppler shifting is turned off. A star shoots past.",
                         "options": {"showDoppler": false, "showGamma": false,"c": 1},
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Observer", "options": {"showVelocity": false}, "shape": aSphere(5,64)},
                                     {"object": extendedObject, "x": [-30, -30, 0], "p": [1.5, 0], "m": 1, "label": "Star", "shape": aSphere(5,64)}
                                    ],
                         "frame": 0},
                        {"caption": "Now watch the same motion with the relativistic Doppler effect visible.",
                         "options": {"showDoppler": true, "c": 1},
                         "objects": [{"object": extendedObject, "x": [0, -10, 0], "p": [0, 0], "m": 1, "label": "Observer", "shape": aSphere(5,64), "options": {"showVelocity": false}},
                                     {"object": extendedObject, "x": [-30, -30, 0], "p": [1.5, 0], "m": 1, "label": "Star", "shape": aSphere(5,64)}
                                    ],
                         "frame": 0}
                       ]
             },
			{"name": "Twin's paradox",
              "steps": [{"caption": "From the point of view of observer 1 who is in an inertial reference frame, we see one twin travelling and returning. From this frame he is younger when he returns because he has been moving.",
						"timeScale": 0.008,
                         "options": {"showFramePos": true, "showVisualPos": false, "showTime": true, "showDoppler": false, "showGamma": false,"c": 1},
                         "objects": [{"object": extendedObject, "x": [0, -20, 0], "p": [0, 0], "m": 1, "label": "Observer 1", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [0, -40, 0], "p": [1.732, 0], "m": 1, "label": "Observer 2", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [173.2, -60, 0], "p": [-1.732, 0], "m": 1, "label": "Observer 3", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
                                     {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0], "m": 1, 
									 "label": "Stationary Twin", "shape": aMan(5,49), "options": {"created": true}},
									 {"object": extendedObject, "x": [0, 0, 0, 0], "p": [1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), 
									 "options": {"created": true, "endPt": quat4.create([86.6, 0, 0, 100])}},
									 {"object": extendedObject, "x": [86.6, 0, 0, 100], "p": [-1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), "options": {"created": true, "initialTau": 50}}
                                    ],
                         "frame": 0},
						{"caption": "Now watch from the point of view of observer 2. At first it looks the same, but watch. When the travelling twin turns around the amount of time dilation changes.",
						"timeScale": 0.008,
                         "options": {"showFramePos": true, "showVisualPos": false, "showTime": true, "showDoppler": false, "showGamma": false,"c": 1},
                         "objects": [{"object": extendedObject, "x": [0, -20, 0], "p": [0, 0], "m": 1, "label": "Observer 1", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [0, -40, 0], "p": [1.732, 0], "m": 1, "label": "Observer 2", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [173.2, -60, 0], "p": [-1.732, 0], "m": 1, "label": "Observer 3", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
                                     {"object": fourEvent, "x": [86.6, 0, 0, 100], "options":{"caption": "This is the asymmetric part of the paradox."}},
                                     {"object": fourEvent, "x": [0, -40, 0, 0], "options":{"caption": "Now watch from the point of view of observer 2. At first it looks the same, but watch. When the travelling twin turns around the amount of time dilation changes."}},
                                     {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0], "m": 1, 
									 "label": "Stationary Twin", "shape": aMan(5,49), "options": {"created": true}},
									 {"object": extendedObject, "x": [0, 0, 0, 0], "p": [1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), 
									 "options": {"created": true, "endPt": quat4.create([86.6, 0, 0, 100])}},
									 {"object": extendedObject, "x": [86.6, 0, 0, 100], "p": [-1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), "options": {"created": true, "initialTau": 50}}
                                    ],
                         "frame": 1},
						{"caption": "Finally we can look at it from the point of view of observer 3, the Travelling twin left quite some time ago in this frame, so let's start part-way through the journey. <p> This marks the end of the demo, the next step button won't work anymore. Feel free to explore, or watch it again looking at the Minkowski diagram below, you can accelerate with w, a, s and d. rotate with q and e. x toggles a light-delayed view, x toggles the measured view you see now.",
						"timeScale": 0.008,
                         "options": {"showFramePos": true, "showVisualPos": false, "showTime": true, "showDoppler": false, "showGamma": false,"c": 1},
                         "objects": [{"object": extendedObject, "x": [0, -20, 0], "p": [0, 0], "m": 1, "label": "Observer 1", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [0, -40, 0], "p": [1.732, 0], "m": 1, "label": "Observer 2", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
									 {"object": extendedObject, "x": [173.2, -60, 0], "p": [-1.732, 0], "m": 1, "label": "Observer 3", "options": {"showVelocity": false, "showMinkowski": false}, "shape": aSphere(5,49)},
                                     {"object": extendedObject, "x": [0, 0, 0], "p": [0, 0], "m": 1, 
									 "label": "Stationary Twin", "shape": aMan(5,49), "options": {"created": true}},
									 {"object": extendedObject, "x": [0, 0, 0, 0], "p": [1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), 
									 "options": {"created": true, "endPt": quat4.create([86.6, 0, 0, 100])}},
									 {"object": extendedObject, "x": [86.6, 0, 0, 100], "p": [-1.732, 0], "m": 1, 
									 "label": "Travelling Twin", "shape": aMan(5,49), "options": {"created": true, "initialTau": 50}}
                                    ],
						 "shift":[0,0,0,-100],
                         "frame": 2}
                       ]
             },


    {"name": "Test thingies.",
                "steps": [{"caption": "Test for some things",
                           "objects": [{"object": extendedObject, "x": [0, -32, 0], "p": [0,0,0], "m": 1, "shape": aSphere(10,100)},
                                       {"object": extendedObject, "x": [-50, -50, 0], "p": [0,0,0], "m": 1, "shape": aMan(10,100)},
                                       {"object": extendedObject, "x": [50, -50, 0], "p": [0,0,0], "m": 1, "shape": potPlant(10,100)},
                                       {"object": extendedObject, "x": [0, 0, 0], "p": [0,0,0], "m": 1, "shape": rAsteroid(10,100)},
                                       {"object": extendedObject, "x": [20, -20, -20], "p": [0,0,0], "m": 1,
                                            "options": {"temperature": 3000},
                                            "label": "A circle",   "shape": aCircle(10,30)},
                                       {"object": photon, "x": [0, 10, 0], "v": [-1, 0, 0], "label": "photon",
                                        "options": {"showCircle": true, "endPt": [300, 10, 0, 0] }}
                                       ],
                           "options": {"showFramePos": true, "showVisualPos": true, "show3D": true, "canShoot": true}
                          }],
                "options": {"canShoot": true}
                }

    

];
var rasteroid;
var rasteroids = [];
for (var i = 0; i < 40; i++){
    rasteroid = {"object": extendedObject, 
                 "x": [Math.random()*200 - 100, Math.random()*200 - 100, 0], 
                 "p": [Math.random()*0.5,Math.random()*0.5,0], "m": 1, 
                 "shape": rAsteroid(Math.random()*40,10),
                 "options": {"showMinkowski": false}};
    rasteroids.push(rasteroid);
    }
    demos[demos.length] = {"name": "RASTEROIDS!",
                "steps": [{"caption": "Test for some things",
                           "objects": rasteroids,
                           "options": {"created": true, "showFramePos": true, "showVisualPos": false, "show3D": false, "canShoot": true, "showGamma": false, "showVelocity": false}
                          }],
                "options": {"canShoot": true}
                };
