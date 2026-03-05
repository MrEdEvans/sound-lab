export default {
    name: "Demo Pattern",
    tempo: 120,
    swing: 0.2,
    length: 8,
    loop: true,
    steps: [
        {
            notes: [
                { note: 60, velocity: 1.0 },
                { note: 64 },
                { note: 67, velocity: 0.7 }
            ],
            velocity: 0.8,
            gate: 0.9
        },
        { notes: [] },
        { notes: [{ note: 62, velocity: 0.9 }], gate: 0.7 },
        // ...
    ]
};
