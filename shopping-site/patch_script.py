import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to remove these exactly:
# const total = cart.reduce((add, item) => add + (item.price * item.quantity), 0);
# window.frictionApi.trackPurchase(total);

content = re.sub(
    r'\s*const total = cart\.reduce.*?\s*window\.frictionApi\.trackPurchase\(total\);',
    '',
    content,
    flags=re.DOTALL
)

with open('script.js', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
