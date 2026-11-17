(function (root, createSolver) {
    const solver = createSolver();

    if (typeof module === "object" && module.exports) {
        module.exports = solver;
    }

    root.MathLabSolver = solver;
})(globalThis, function () {
    "use strict";

    function formatNumber(value) {
        if (Object.is(value, -0)) {
            value = 0;
        }
        return Number(value.toPrecision(6)).toString().replace(/-/g, "−");
    }

    function signedTerm(value, variable) {
        const sign = value < 0 ? "−" : "";
        const magnitude = Math.abs(value);
        const coefficient = variable && magnitude === 1 ? "" : formatNumber(magnitude);
        return `${sign}${coefficient}${variable}`;
    }

    function formatEquation(a, b, c) {
        const aTerm = signedTerm(a, "x²");
        const bTerm = `${Math.abs(b) === 1 ? "" : formatNumber(Math.abs(b))}x`;
        const bOperator = b < 0 ? " − " : " + ";
        const cOperator = c < 0 ? " − " : " + ";
        return `${aTerm}${bOperator}${bTerm}${cOperator}${formatNumber(Math.abs(c))} = 0`;
    }

    function formatBinomial(value) {
        return value < 0
            ? `x − ${formatNumber(Math.abs(value))}`
            : `x + ${formatNumber(value)}`;
    }

    function formatSignedValue(value) {
        const magnitude = formatNumber(Math.abs(value));
        return value < 0 ? `−${magnitude}` : magnitude;
    }

    function formatArithmetic(first, second, third) {
        const secondSign = second < 0 ? " − " : " + ";
        const thirdSign = third < 0 ? " − " : " + ";
        return `${formatSignedValue(first)}${secondSign}${formatNumber(Math.abs(second))}${thirdSign}${formatNumber(Math.abs(third))}`;
    }

    function buildSolutionCheck(a, b, c, root, label) {
        const aTerm = a * root ** 2;
        const bTerm = b * root;
        let total = aTerm + bTerm + c;
        if (Math.abs(total) < 1e-9) {
            total = 0;
        }
        const rootText = formatNumber(root);
        const substitution = `${formatNumber(a)}(${rootText})² + (${formatSignedValue(b)})(${rootText}) + (${formatSignedValue(c)})`;
        return `Check ${label}: ${substitution} = ${formatArithmetic(aTerm, bTerm, c)} = ${formatNumber(total)}.`;
    }

    function validateCoefficients(a, b, c) {
        if (![a, b, c].every(Number.isFinite)) {
            throw new Error("Enter a finite number in each box.");
        }
        if (a === 0) {
            throw new Error("a cannot be 0. If a = 0, the equation is not quadratic.");
        }
    }

    function solveQuadraticFormula(a, b, c) {
        validateCoefficients(a, b, c);

        const discriminant = b ** 2 - 4 * a * c;
        if (!Number.isFinite(discriminant)) {
            throw new Error("These numbers are too large to calculate. Please try smaller values.");
        }

        const steps = [
            "1. Identify the coefficients: a multiplies x², b multiplies x, and c is the constant.",
            `   a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`,
            "2. Write the formula: x = [−b ± √(b² − 4ac)] / (2a).",
            "3. Substitute a, b and c into the discriminant:",
            `   D = (${formatNumber(b)})² − 4 × (${formatNumber(a)}) × (${formatNumber(c)})`,
            `   D = ${formatNumber(b ** 2)} − ${formatNumber(4 * a * c)}`,
            `   D = ${formatNumber(discriminant)}`,
        ];

        if (discriminant < 0) {
            steps.push(
                "4. D is negative, so √D is not a real number. There are no real-number solutions."
            );
            return { roots: null, discriminant, steps };
        }

        const squareRoot = Math.sqrt(discriminant);
        const denominator = 2 * a;
        const firstRoot = (-b + squareRoot) / denominator;
        const secondRoot = (-b - squareRoot) / denominator;

        if (![squareRoot, denominator, firstRoot, secondRoot].every(Number.isFinite)) {
            throw new Error("These numbers are too large to calculate. Please try smaller values.");
        }

        steps.push(
            `4. Take the square root: √D = √${formatNumber(discriminant)} = ${formatNumber(squareRoot)}.`,
            "5. Substitute into the formula and simplify −b:",
            `   x = [−(${formatNumber(b)}) ± ${formatNumber(squareRoot)}] / (2 × ${formatNumber(a)})`,
            `   x = [${formatNumber(-b)} ± ${formatNumber(squareRoot)}] / ${formatNumber(denominator)}`,
            "6. Calculate the plus answer:",
            `   x₁ = (${formatNumber(-b)} + ${formatNumber(squareRoot)}) / ${formatNumber(denominator)}`,
            `   x₁ = ${formatNumber(-b + squareRoot)} / ${formatNumber(denominator)} = ${formatNumber(firstRoot)}`
        );

        if (discriminant === 0) {
            steps.push(
                "7. Since D = 0, the plus and minus signs give the same repeated root.",
                buildSolutionCheck(a, b, c, firstRoot, "x₁"),
                `The repeated solution is x = ${formatNumber(firstRoot)}.`
            );
            return { roots: [firstRoot, secondRoot], discriminant, steps };
        }

        steps.push(
            "7. Calculate the minus answer:",
            `   x₂ = (${formatNumber(-b)} − ${formatNumber(squareRoot)}) / ${formatNumber(denominator)}`,
            `   x₂ = ${formatNumber(-b - squareRoot)} / ${formatNumber(denominator)} = ${formatNumber(secondRoot)}`,
            "8. Check both answers in the original equation:",
            `   ${buildSolutionCheck(a, b, c, firstRoot, "x₁")}`,
            `   ${buildSolutionCheck(a, b, c, secondRoot, "x₂")}`,
            `Final answer: x₁ = ${formatNumber(firstRoot)} and x₂ = ${formatNumber(secondRoot)}.`
        );
        return { roots: [firstRoot, secondRoot], discriminant, steps };
    }

    function solveCompletingSquare(a, b, c) {
        validateCoefficients(a, b, c);

        const discriminant = b ** 2 - 4 * a * c;
        if (!Number.isFinite(discriminant)) {
            throw new Error("These numbers are too large to calculate. Please try smaller values.");
        }

        const xCoefficient = b / a;
        const constant = c / a;
        const halfCoefficient = xCoefficient / 2;
        const addedSquare = halfCoefficient ** 2;
        const rightSide = addedSquare - constant;
        if (![xCoefficient, constant, halfCoefficient, addedSquare, rightSide].every(Number.isFinite)) {
            throw new Error("These numbers are too large to calculate. Please try smaller values.");
        }

        const steps = [
            "1. Divide every term by a so the coefficient of x² becomes 1:",
            `   ${formatEquation(a, b, c)}`,
            `   x² + (${formatNumber(xCoefficient)})x + (${formatNumber(constant)}) = 0`,
            "2. Move the constant term to the right side:",
            `   x² + (${formatNumber(xCoefficient)})x = ${formatNumber(-constant)}`,
            "3. Take half of the x coefficient and square it:",
            `   Half of ${formatNumber(xCoefficient)} is ${formatNumber(halfCoefficient)}.`,
            `   (${formatNumber(halfCoefficient)})² = ${formatNumber(addedSquare)}`,
            "4. Add this same number to both sides:",
            `   x² + (${formatNumber(xCoefficient)})x + ${formatNumber(addedSquare)}`,
            `       = ${formatNumber(-constant)} + ${formatNumber(addedSquare)}`,
            `   (${formatBinomial(halfCoefficient)})² = ${formatNumber(rightSide)}`,
        ];

        if (rightSide < 0) {
            steps.push(
                "5. The right side is negative, so its square root is not real. There are no real-number solutions."
            );
            return { roots: null, discriminant, steps };
        }

        const squareRoot = Math.sqrt(rightSide);
        const firstRoot = -halfCoefficient + squareRoot;
        const secondRoot = -halfCoefficient - squareRoot;
        if (![squareRoot, firstRoot, secondRoot].every(Number.isFinite)) {
            throw new Error("These numbers are too large to calculate. Please try smaller values.");
        }

        steps.push(
            `5. Take the square root of both sides: ${formatBinomial(halfCoefficient)} = ± √${formatNumber(rightSide)}.`,
            `   ${formatBinomial(halfCoefficient)} = ± ${formatNumber(squareRoot)}`,
            "6. Solve the plus and minus cases separately:",
            `   x₁ = ${formatNumber(-halfCoefficient)} + ${formatNumber(squareRoot)} = ${formatNumber(firstRoot)}`,
            `   x₂ = ${formatNumber(-halfCoefficient)} − ${formatNumber(squareRoot)} = ${formatNumber(secondRoot)}`,
            "7. Check both answers in the original equation:",
            `   ${buildSolutionCheck(a, b, c, firstRoot, "x₁")}`,
            `   ${buildSolutionCheck(a, b, c, secondRoot, "x₂")}`,
            `Final answer: x₁ = ${formatNumber(firstRoot)} and x₂ = ${formatNumber(secondRoot)}.`
        );
        return { roots: [firstRoot, secondRoot], discriminant, steps };
    }

    return {
        formatEquation,
        formatNumber,
        solveCompletingSquare,
        solveQuadraticFormula,
    };
});
