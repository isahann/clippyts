import fs, { readdirSync } from 'fs';
import path from 'path';
import buble from '@rollup/plugin-buble';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import styles from "rollup-plugin-styles";
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const { dependencies } = require('./package.json');

const name = 'clippy'
const dist = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

// prepare agent configs
const agentDir = path.resolve(__dirname, 'src/agents');
const agentConfigs = getDirectories(agentDir).map(agent => {
    console.log("agent: " + agent, agentDir);
    return {
        input: `${agentDir}/${agent}/index.ts`,
        plugins: [
            typescript(),
            image({
                dom: false,
                include: /\.(png|jpg)$/,
            }),
            terser(),
        ],
        output: [
            {
                file: dist + `/agents/${agent}.js`,
                format: 'iife',
                name: `${name}.agents.${agent}`,
                sourcemap: false,
            },

        ]
    }
});



module.exports = [{
    input: 'src/index.ts',
    external: Object.keys(dependencies),
    plugins: [
        typescript(),
        styles(),
        buble(),
        nodeResolve(),
        commonjs(),
        terser(),
    ],
    output: [
        {
            file: dist + '/' + name + '.js',
            format: 'umd',
            name: name,
            sourcemap: true,
        },
        {
            format: 'es',
            file: dist + '/' + name + '.esm.js',
            sourcemap: true,
        },
    ]
},
...agentConfigs
];
