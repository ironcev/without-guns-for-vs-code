class IsStraightforward {
    Straightforward() {}
}

class You {
    You(abilities: string[]) {}
}

class IsGives {
    Is() {
        return new IsStraightforward();
    }
    Gives() {
        return new You();
    }    
}

class Guns {
    Guns() {
        return new IsGives();
    }
}

class Coding {
    With() {
        return new Guns();
    }
    Without() {
        return new Guns();
    }
}

function demo() {
    let coding = new Coding();

    // Coding with guns. The usual way.
    coding.With().Guns().Is().Straightforward();

    // Coding without guns. 
    coding
        .Without()
        .Guns()
        .Gives()
        .You([
            "Confidence",
            "Deep knowledge"
        ]);
}