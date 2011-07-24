function f(x, y)      { return 50 * y * (x - 0.6) * (x - 0.85); } // `y' = f(x, y)`
function f_(point)    { return f(point[0], point[1]); } // just for convenience

// exact solution of Cauchy problem `y' = f(x, y); f(0) = 0.1`
function exactSolution(x) { return 0.1 * Math.exp(x * (50 / 3 * x * x - 36.25 * x + 25.5)); }

// derivatives of `f`, used in Taylor2 and Taylor3 methods
function dfdx(x, y)   { return 50 * (x - 0.85) * y + 50 * (x - 0.6) * y; }
function dfdy(x, y)   { return 50 * (x - 0.85) * (x - 0.6); }
function dfd2x(x, y)  { return 100 * y; }
function dfdxdy(x, y) { return 50 * (x - 0.85) + 50 * (x - 0.6); }

var ExactSolution = {
    label: "Exact solution",
    step: function(h, prevCoords) {
        var xNext = prevCoords[0] + h,
            yNext = exactSolution(xNext);
        return [xNext, yNext];
    }
};

var Euler = {
    label: "Euler method",
    step: function(h, prevCoords) {
        var xPrev = prevCoords[0],
            yPrev = prevCoords[1];

        var yNext = yPrev + h * f(xPrev, yPrev),
            xNext = xPrev + h;
        return [xNext, yNext];
    }
};

var BackwardEuler = {
    label: "Backward Euler method",
    step: function(h, prevCoords) {
        var xPrev = prevCoords[0],
            yPrev = prevCoords[1];

        var xNext = xPrev + h;
        var yPredictor = yPrev + h * f(xPrev, yPrev);
        var yNext = yPrev + (h / 2) * (f(xPrev, yPrev) + f(xNext, yPredictor));
        return [xNext, yNext];
    }
};

var Cauchy = {
    label: "Cauchy method",
    step: function(h, prevCoords) {
        var xPrev = prevCoords[0],
            yPrev = prevCoords[1];

        var xNext = xPrev + h;
        var yPredictor = yPrev + (h / 2) * f(xPrev, yPrev);
        var yNext = yPrev + h * f(xPrev + h/2, yPredictor);
        return [xNext, yNext];
    }
};

var RungeKutta4 = {
    label: "Fourth-order Runge–Kutta method",
    step: function(h, prevCoords) {
        var xPrev = prevCoords[0],
            yPrev = prevCoords[1];
        
        var xNext = xPrev + h;
        var k1 = f(xPrev, yPrev);
        var k2 = f(xPrev + (h / 2), yPrev + (h / 2) * k1);
        var k3 = f(xPrev + (h / 2), yPrev + (h / 2) * k2);
        var k4 = f(xPrev + h, yPrev + h * k3);
        var yNext = yPrev + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        return [xNext, yNext];
    }
};

var Adams4 = {
    label: "Fourth-order Adams method",
    init: function(h, p1) {
        var p2 = RungeKutta4.step(h, p1),
            p3 = RungeKutta4.step(h, p2),
            p4 = RungeKutta4.step(h, p3);
        this.previousPoints = [p1, p2, p3, p4];
        return this.previousPoints.slice(); // return copy of this.previousPoints
    },
    step: function(h, prevCoords) {
        var xPrev = this.previousPoints[3][0],
            yPrev = this.previousPoints[3][1];

        var xNext = xPrev + h;
        var yNext = yPrev + h * (55 / 24 * f_(this.previousPoints[3]) -
                                 59 / 24 * f_(this.previousPoints[2]) +
                                 37 / 24 * f_(this.previousPoints[1]) -
                                 9  / 24 * f_(this.previousPoints[0]));
        this.previousPoints.shift();
        this.previousPoints.push([xNext, yNext]);
        return [xNext, yNext];
    }
};

var Taylor2 = {
    label: "Second-order Taylor method",
    step: function(h, prevCoords) {
        var x = prevCoords[0],
            y = prevCoords[1];
        
        var xNext = x + h;
        var yNext = y + h * f(x, y) +
                        h * h / 2 * (dfdx(x, y) + dfdy(x, y) * f(x, y));
        return [xNext, yNext];
    }
};

var Taylor3 = {
    label: "Third-order Taylor method",
    step: function(h, prevCoords) {
        var x = prevCoords[0],
            y = prevCoords[1];

        var dFdx = dfdx(x, y) + dfdy(x, y) * f(x, y);
        var yNext = y + h * f(x, y) +
                        h * h / 2 * dFdx +
                        h * h * h / 6 * (dfd2x(x, y) + 2 * dfdxdy(x, y) * f(x, y) + dfdy(x, y) * dFdx);
        var xNext = x + h;
        return [xNext, yNext];
    }
};
