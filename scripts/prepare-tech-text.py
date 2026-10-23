"""Port the upstream canvas engine to a buildless DOM initializer."""
from pathlib import Path

source = Path('vendor/TechText.original.jsx').read_text(encoding='utf-8')
helpers = source[source.index('const LABEL_FONT'):source.index('const TechText =')]
defaults = source[source.index('  text ='):source.index('}) => {')]
settings = source[source.index('    settingsRef.current = {'):source.index('    wakeRef.current();')]
body = source[source.index('    const canvas = canvasRef.current;'):source.index('  }, []);')]
body = body.replace('const canvas = canvasRef.current;', "const canvas = container.querySelector('canvas');")
# Use the Figma's text origin rather than the component demo's 5% inset.
body = body.replace('(width * 0.9)', '(width * 0.99)').replace('const margin = width * 0.05;', 'const margin = 2;')
body = body.replace("height = Math.max(1, container.clientHeight);", "height = Math.max(1, container.clientHeight);\n      settingsRef.current.fontSize = parseFloat(getComputedStyle(container).fontSize);")
output = '// Adapted from React Bits TechText by David Haz. See vendor/react-bits-LICENSE.md.\n'
output += '// Canvas engine preserved; React lifecycle replaced with a DOM initializer.\n'
output += helpers + '\nwindow.mountTechText = function (container, {\n' + defaults + '} = {}) {\n'
output += '  const settingsRef = { current: null };\n  const wakeRef = { current: () => {} };\n'
output += settings + body + '\n};\n'
Path('tech-text.js').write_text(output, encoding='utf-8')
