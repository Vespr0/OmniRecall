import { DrillParser } from '../src/parser/drillParser';
import { App, TFile } from 'obsidian';

describe('DrillParser', () => {
  const mockApp = {
    metadataCache: {
      getFileCache: () => ({ tags: [{ tag: '#drills' }] }),
    },
  } as unknown as App;

  const mockFile = {
    path: 'folder/test.md',
    parent: { path: 'folder' },
  } as unknown as TFile;

  it('should parse single-choice drill with radio syntax - ( ) and - (x)', async () => {
    const text = `#drills

What is the SI unit of power?
?
- ( ) Joule
- (x) Watt
- ( ) Newton
- ( ) Volt

**Solution:**
Watt is defined as one joule per second.
`;

    const parser = new DrillParser(mockApp);
    const drills = await parser.parseFile(mockFile, text);

    expect(drills.length).toBe(1);
    expect(drills[0].type).toBe('single-choice');
    expect(drills[0].options.length).toBe(4);
    expect(drills[0].options[1].isCorrect).toBe(true);
    expect(drills[0].options[0].isCorrect).toBe(false);
  });

  it('should parse single-choice drill with standard single checkbox - [x]', async () => {
    const text = `#drills

Which planet is known as the Red Planet?
?
- [ ] Venus
- [x] Mars
- [ ] Jupiter
`;

    const parser = new DrillParser(mockApp);
    const drills = await parser.parseFile(mockFile, text);

    expect(drills.length).toBe(1);
    expect(drills[0].type).toBe('single-choice');
    expect(drills[0].options.length).toBe(3);
    expect(drills[0].options[1].isCorrect).toBe(true);
  });

  it('should parse multiple-choice drill when multiple options are checked', async () => {
    const text = `#drills

Which of the following are prime numbers?
?
- [x] 2
- [x] 3
- [ ] 4
- [x] 5
- [ ] 6
`;

    const parser = new DrillParser(mockApp);
    const drills = await parser.parseFile(mockFile, text);

    expect(drills.length).toBe(1);
    expect(drills[0].type).toBe('multiple-choice');
    expect(drills[0].options.length).toBe(5);
    const correctCount = drills[0].options.filter(o => o.isCorrect).length;
    expect(correctCount).toBe(3);
  });

  it('should parse multiple-choice drill when explicitly marked select all', async () => {
    const text = `#drills

Which of the following is an inert gas? (Select all that apply)
?
- [x] Argon
- [ ] Nitrogen
- [ ] Oxygen
`;

    const parser = new DrillParser(mockApp);
    const drills = await parser.parseFile(mockFile, text);

    expect(drills.length).toBe(1);
    expect(drills[0].type).toBe('multiple-choice');
  });

  it('should parse standard Q&A drill without options', async () => {
    const text = `#drills

Calculate the energy of a finite pulse.
?
**Step-by-step Solution:**
$$E = 8/3 J$$
`;

    const parser = new DrillParser(mockApp);
    const drills = await parser.parseFile(mockFile, text);

    expect(drills.length).toBe(1);
    expect(drills[0].type).toBe('standard');
    expect(drills[0].options.length).toBe(0);
  });
});
