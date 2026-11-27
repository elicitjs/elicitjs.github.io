import { Redirect } from '../../../components/Redirect';

// Split in two: the wrapped bars kept the walkthrough, and the coil and spiral
// moved to their own page. Old links land on the wrapped bars.
export default function Moved() {
  return <Redirect to="/case-studies/du-bois-wrapped/" />;
}
